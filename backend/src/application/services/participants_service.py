import math

from application.services.events_service import EventsService
from application.services.user_service import UsersService
from domain.exceptions import ObjectNotFoundError, BadRequestError
from domain.interfaces.repositories.participants_repository import ParticipantsRepository
from domain.interfaces.repositories.teams_repository import TeamsRepository
from domain.models.events import EventTracksRead
from domain.models.participants import ParticipantsCreate, ParticipantsRead, ParticipantsDetailsRead
from domain.models.teams import TeamsCreate

from domain.models.participants import ParticipantsUpdate

from domain.exceptions import AccessDeniedError

from domain.interfaces.sorter import Sorter

from domain.models.participants import ParticipantsWithPagination


class ParticipantsService:
    def __init__(self, repository: ParticipantsRepository, teams_repository: TeamsRepository, event_service: EventsService, users_service: UsersService, sorter: Sorter):
        self.repository = repository
        self.users_service = users_service
        self.event_service = event_service
        self.teams_repository = teams_repository
        self.sorter = sorter

    async def model_domain_to_create(self, participant_domain):
        try:
            track_read = await self.event_service.get_track(participant_domain.track_id)
        except ObjectNotFoundError:
            # -----
            track_read = EventTracksRead(
                name="не указано",
                id="0 (не указано)",
                event_id="0 не указано"
            )
            # -----
            # временная заглушка, нужна для дебага. Должен быть BadRequestError
            # raise BadRequestError

        participant_read = ParticipantsRead.from_domain(participant_domain, track_read)
        return participant_read


    async def create_participant(self, participants_create_api, user_id):
        # проверка что event id реальный
        try:
            event = await self.event_service.get_event(participants_create_api.event_id)
            track = await self.event_service.get_track(participants_create_api.track_id)
        except ObjectNotFoundError:
            raise BadRequestError # 400 в этом случае будет понятнее чем 404, так как ошибка именно в данных
        participants_create = ParticipantsCreate.model_validate(participants_create_api.model_copy(update={"user_id": user_id}), from_attributes=True)
         # добавление user_id для вставки в бд, а также бизнес правило о том, что тимлид должен иметь команду.
        participant_domain = await self.repository.create(participants_create) # вставка в бд
        participant_read = await self.model_domain_to_create(participant_domain) # переход в read модель - читаемый формат треков (название + айди)
        # TODO вынести в api слой, application не должен знать про апи модель !
        # print(participants_create.team)
        if participants_create.team:
            # print(participants_create.team)
            new_team = TeamsCreate.map_to_domain_model(participant_read.event_id, participant_read.id, participants_create.team) # маппинг модели новой тимы , это нельзя сделать до вставки в бд, ведь нужен id участника, а он получается после вставки в бд
            # event_id есть только в domain модели, api слой не должен про него знать. добавление новой команды с таким же event_id - это бизнес логика
            for vacancy in new_team.vacancies:
                try:
                    self.event_service.get_track(vacancy.event_track_id)
                except ObjectNotFoundError:
                    raise BadRequestError
            await self.teams_repository.create(new_team)
            # к репозиториям других сервисов так нельзя обращаться, но это вынужденный компромисс - иначе получилась бы цикличная зависимость

        return participant_read

    async def get_participants(self, user_id):
        participants = await self.repository.get_all_for_user(user_id, limit=1000, offset=0)
        participants_read = [await self.model_domain_to_create(participant) for participant in participants]
        return participants_read

    async def get_event_participants(self, event_id, relevant_sort=False, team_id=None, page=1, per_page=10):
        offset = (page - 1) * per_page
        limit = per_page
        total_count = await self.repository.total_count_for_event(event_id)
        if relevant_sort and team_id:
            participants = await self.sorter.sort_participants(event_id, team_id, limit=limit, offset=offset)
        else:
            participants = await self.repository.get_all_for_event(event_id, limit=limit, offset=offset)

        total_pages = math.ceil(total_count / per_page)

        user_ids = [participant.user_id for participant in participants]
        participants_read = [await self.model_domain_to_create(participant) for participant in participants]
        user_read = await self.users_service.get_users_by_ids(user_ids)
        users_by_id = {user.id: user for user in user_read}

        participants_detail_read = []
        for participant in participants_read:
            user = users_by_id.get(participant.user_id)
            if not user:
                continue

            participants_detail_read.append(ParticipantsDetailsRead(
                id=participant.id,
                user_id=participant.user_id,
                event_id=participant.event_id,
                track=participant.track,
                event_role=participant.event_role,
                resume=participant.resume,
                login=user.login,
                email=user.email,
                tg_nickname=user.tg_nickname,
                role=user.role
            ))

        participants_with_pagination = ParticipantsWithPagination(
            items=participants_detail_read,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        return participants_with_pagination

    async def get_participant(self, participant_id):
        participant = await self.repository.get(participant_id)
        return await self.model_domain_to_create(participant)

    async def get_detail_participant(self, participant_id):
        participant = await self.get_participant(participant_id)
        user = await self.users_service.get_user(participant.user_id)
        return ParticipantsDetailsRead(
            **participant.model_dump(),
            login=user.login,
            email=user.email,
            tg_nickname=user.tg_nickname,
            role=user.role
        )

    async def get_detail_participants_by_ids(self, ids):
        participants = await self.repository.get_all_by_ids(ids)
        user_ids = [participant.user_id for participant in participants]
        participants_read = [await self.model_domain_to_create(participant) for participant in participants]
        user_read = await self.users_service.get_users_by_ids(user_ids)
        users_by_id = {user.id: user for user in user_read}

        participants_detail_read = []
        for participant in participants_read:
            user = users_by_id.get(participant.user_id)
            if not user:
                continue

            participants_detail_read.append(ParticipantsDetailsRead(
                id=participant.id,
                user_id=participant.user_id,
                event_id=participant.event_id,
                track=participant.track,
                event_role=participant.event_role,
                resume=participant.resume,
                login=user.login,
                email=user.email,
                tg_nickname=user.tg_nickname,
                role=user.role
            ))

        return participants_detail_read

    async def change_participant_role(self, participant_id):
        participant = await self.repository.get(participant_id)
        participant_update_model = ParticipantsUpdate(
            id=participant.id)
        if participant.event_role == "PARTICIPANT":
            participant_update_model.event_role = "TEAMLEAD"
        elif participant.event_role == "TEAMLEAD":
            participant_update_model.event_role = "PARTICIPANT"
        await self.repository.update(participant_update_model)

    async def patch_participant(self, update_participant, user_id):
        participant = await self.repository.get(update_participant.id)
        if update_participant.track_id:
            try:
                track = await self.event_service.get_track(update_participant.track_id)
            except:
                raise ObjectNotFoundError
        if participant.user_id == user_id:
            return await self.repository.update(update_participant)
        else:
            raise AccessDeniedError

    async def delete_participant(self, participant_id, user_id):
        participant = await self.repository.get(participant_id)
        if participant.user_id == user_id:
            await self.repository.delete(participant_id)
        else:
            raise AccessDeniedError
