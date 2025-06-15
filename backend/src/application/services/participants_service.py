from backend.src.application.services.events_service import EventsService
from backend.src.application.services.teams_service import TeamsService
from backend.src.domain.exceptions import ObjectNotFoundError, BadRequestError
from backend.src.domain.interfaces.repositories.participants_repository import ParticipantsRepository
from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.participants import ParticipantsCreate, ParticipantsRead
from backend.src.domain.models.teams import TeamsCreate


class ParticipantsService:
    def __init__(self, repository: ParticipantsRepository, event_service: EventsService, teams_service: TeamsService):
        self.repository = repository
        self.event_service = event_service
        self.teams_service = teams_service

    async def model_domain_to_create(self, participant_domain):
        try:
            track_read = await self.event_service.get_track(participant_domain.track_id)
        except ObjectNotFoundError:
            track_read = EventTracksRead(
                name="не указано",
                id="0 (не указано)"
            )
            # raise BadRequestError

        participant_read = ParticipantsRead.from_domain(participant_domain, track_read)
        return participant_read


    async def create_participant(self, participants_create_api, user_id):
        participants_create = ParticipantsCreate.map_to_domain_read_model(user_id, participants_create_api) # добавление user_id для вставки в бд, а также бизнес правило о том, что тимлид должен иметь команду.
        participant_domain = await self.repository.create(participants_create) # вставка в бд
        participant_read = await self.model_domain_to_create(participant_domain) # переход в read модель - читаемый формат треков (название + айди)

        if participants_create.team:
            new_team = TeamsCreate.map_to_domain_model(participant_read.event_id, participant_read.id, participants_create_api.team) # маппинг модели новой тимы , это нельзя сделать до вставки в бд, ведь нужен id участника, а он получается после вставки в бд
            # event_id есть только в domain модели, api слой не должен про него знать. добавление новой команды с таким же event_id - это бизнес логика

            await self.teams_service.add_team(new_team)

        return participant_read

    async def get_participants(self, user_id):
        participants = await self.repository.get_all_for_user(user_id, limit=1000, offset=0)
        participants_read = [await self.model_domain_to_create(participant) for participant in participants]
        return participants_read