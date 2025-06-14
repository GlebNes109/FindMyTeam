from backend.src.application.services.events_service import EventsService
from backend.src.domain.exceptions import ObjectNotFoundError, BadRequestError
from backend.src.domain.interfaces.participants_repository import ParticipantsRepository
from backend.src.domain.models.participants import ParticipantsCreate, ParticipantsRead


class ParticipantsService:
    def __init__(self, repository: ParticipantsRepository, event_service: EventsService):
        self.repository = repository
        self.event_service = event_service

    async def create_participant(self, participants_create_api, user_id):
        participant = await self.repository.create(ParticipantsCreate.map_to_domain_model(user_id, participants_create_api.model_dump()))
        try:
            track_read = await self.event_service.get_track(participant.track_id)
        except ObjectNotFoundError:
            raise BadRequestError
        # print("fd0safas9f" + track_read)
        participant_read = ParticipantsRead(track=track_read, **participant.model_dump())
        return participant_read