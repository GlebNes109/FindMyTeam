from pydantic_core._pydantic_core import ValidationError

from application.services.events_service import EventsService
from application.services.participants_service import ParticipantsService
from application.services.teams_service import TeamsService
from domain.exceptions import BadRequestError, AccessDeniedError
from domain.interfaces.repositories.team_requests_repository import TeamRequestsRepository
from domain.models.participants import EventRole
from domain.models.teamrequests import TeamRequestsCreate, TeamRequestsPartialCreate, TeamRequestsUpdate, \
    TeamRequestsDetailsRead
from domain.models.teams import TeamMembersCreate
from typing import List

from domain.exceptions import ObjectAlreadyExistsError


class TeamRequestsService:
    def __init__(self, repository: TeamRequestsRepository, teams_service: TeamsService, participants_service: ParticipantsService, event_service: EventsService):
        self.repository = repository
        self.participants_service = participants_service
        self.teams_service = teams_service
        self.event_service = event_service

    async def create(self, user_id, team_request_partial_create: TeamRequestsPartialCreate):
        # проверка, это отклик или приглашение?
        participant = await self.participants_service.get_participant(team_request_partial_create.participant_id) # получить участника, который указан в реквесте
        vacancy_read = await self.teams_service.get_vacancy(team_request_partial_create.vacancy_id) # получить вакансию
        team = await self.teams_service.get_team(vacancy_read.team_id) # по вакансии получить id команды
        """this_user_participants = await self.participants_service.get_participants(
            user_id)  # по команде получить участия юзера (пользователя системы, который инициировал запрос)
        this_user_participants_ids = [participant.id for participant in this_user_participants] # айди его участия в удобном формате списка
"""
        teamlead = await self.participants_service.get_participant(team.teamlead_id)

        # если отклик -> user_id соотвествует указанному participant
        if user_id == participant.user_id and participant.event_role == EventRole.PARTICIPANT: # отклик - participant это и есть юзер.
            team_requests_create = TeamRequestsCreate(
                # approved_by_teamlead=False,
                approved_by_participant=True,
                **team_request_partial_create.model_dump()
            )

        # если приглашение -> user_id соотвествует тимлиду в команде, в которой вакансия
        elif user_id != participant.user_id and participant.event_role == EventRole.PARTICIPANT and teamlead.user_id == user_id: # приглашение - participant не является юзером, однако user в числе прочих регистраций зареган на этот ивент как тимлид
            team_requests_create = TeamRequestsCreate(
                # approved_by_teamlead=False,
                approved_by_teamlead=True,
                **team_request_partial_create.model_dump()
            )

        else:
            raise BadRequestError

        # проверка, подходит ли трек participant под вакансию, на которую он собирается
        if vacancy_read.track.id != participant.track.id:
            raise BadRequestError

        # проверка, что все действие происходит в рамках одного ивента (то есть participant и vacancy на одном ивенте)
        if team.event_id != participant.event_id:
            raise BadRequestError

        # проверка что participant не состоит в командах
        teams = await self.teams_service.get_teams(team.event_id)
        for team in teams:
            if participant.id in team.members_ids:
                raise ObjectAlreadyExistsError

        # проверка, есть ли уже приглашения или отклики НА ЭТУ ВАКАНСИЮ
        check1 = await self.repository.get_all_with_params(approved_by_teamlead=True, approved_by_participant=None, participant_id=team_requests_create.participant_id, vacancies_ids=[team_requests_create.vacancy_id])
        check2 = await self.repository.get_all_with_params(approved_by_participant=True, approved_by_teamlead=None, participant_id=team_requests_create.participant_id, vacancies_ids=[team_requests_create.vacancy_id])
        # print(check1, check2)

        if check1 or check2:
            raise ObjectAlreadyExistsError

        team_request = await self.repository.create(team_requests_create)
        return team_request
        # TODO по возможности вынести логику в domain модель

    async def get_team_requests(self,
            participant_id: str,
            user_id: str,
            direction: str  # 'incoming' или 'outgoing'
    ) -> List[TeamRequestsDetailsRead]:
        participant = await self.participants_service.get_participant(participant_id)

        if not participant.check_user_id(user_id):
            raise BadRequestError

        if participant.event_role not in (EventRole.PARTICIPANT, EventRole.TEAMLEAD):
            raise Exception("Некорректная роль участника")

        params = {}

        if direction == 'outgoing':
            if participant.event_role == EventRole.PARTICIPANT:
                params = {
                    'approved_by_participant': True,
                    'approved_by_teamlead': None,
                    'participant_id': participant_id
                }
            else:  # TEAMLEAD
                team = await self.teams_service.get_team_by_teamlead_id(participant.id)
                vacancies_ids = [vacancy.id for vacancy in team.vacancies]
                params = {
                    'approved_by_participant': None,
                    'approved_by_teamlead': True,
                    'vacancies_ids': vacancies_ids
                }
        elif direction == 'incoming':
            if participant.event_role == EventRole.PARTICIPANT:
                params = {
                    'approved_by_participant': None,
                    'approved_by_teamlead': True,
                    'participant_id': participant_id
                }
            else:  # TEAMLEAD
                team = await self.teams_service.get_team_by_teamlead_id(participant.id)
                vacancies_ids = [vacancy.id for vacancy in team.vacancies]
                params = {
                    'approved_by_participant': True,
                    'approved_by_teamlead': None,
                    'vacancies_ids': vacancies_ids
                }
        else:
            raise ValueError("Неверное значение direction")

        # базовые read модели из репозитория
        read_requests = await self.repository.get_all_with_params(**params)

        result = []
        for request in read_requests:
            # загрузка vacancy по id из реквеста
            vacancy = await self.teams_service.get_vacancy(request.vacancy_id)

            # Создание модели TeamRequestsDetailsRead в зависимости от роли (необходимо переделать . сейчас есть проблема)
            if participant.is_teamlead():
                participant_obj = await self.participants_service.get_detail_participant(request.participant_id)
                model = TeamRequestsDetailsRead(
                    id=request.id,
                    vacancy=vacancy,
                    team=None,
                    participant=participant_obj,
                    approved_by_teamlead=request.approved_by_teamlead,
                    approved_by_participant=request.approved_by_participant,
                )
            else:
                team = await self.teams_service.get_team(vacancy.team_id) if vacancy else None
                model = TeamRequestsDetailsRead(
                    id=request.id,
                    vacancy=vacancy,
                    team=team,
                    participant=None,
                    approved_by_teamlead=request.approved_by_teamlead,
                    approved_by_participant=request.approved_by_participant,
                )
            result.append(model)

        return result

    async def get_outgoing(self, participant_id, user_id):
        return await self.get_team_requests(participant_id, user_id, direction='outgoing')

    async def get_incoming(self, participant_id, user_id):
        return await self.get_team_requests(participant_id, user_id, direction='incoming')

    async def _handle_request_approval(self, request_id: int, user_id: int, approve: bool):
        request = await self.repository.get(request_id)
        participant = await self.participants_service.get_participant(request.participant_id)
        vacancy_read = await self.teams_service.get_vacancy(request.vacancy_id)  # получить вакансию
        team = await self.teams_service.get_team(vacancy_read.team_id)
        """this_user_participants = await self.participants_service.get_participants(
            user_id)  # по команде получить участия юзера (пользователя системы, который инициировал запрос)
        this_user_participants_ids = [participant.id for participant in this_user_participants]"""
        teamlead = await self.participants_service.get_participant(team.teamlead_id)

        if user_id != participant.user_id and not participant.is_teamlead() and teamlead.user_id == user_id:
            request.approved_by_teamlead = approve

        elif participant.user_id == user_id and not participant.is_teamlead():
            request.approved_by_participant = approve

        else:
            raise AccessDeniedError # нет прав доступа чтобы апрувнуть приглашение

        if approve and request.approved_by_teamlead and request.approved_by_participant:
            await self.teams_service.create_member(TeamMembersCreate(
                participant_id=request.participant_id,
                team_id=vacancy_read.team_id
            ))
            await self.teams_service.delete_vacancy(vacancy_read.id)
        try:
            await self.repository.update(TeamRequestsUpdate.model_validate(request, from_attributes=True))
        except ValidationError:
            raise BadRequestError
        if approve and not (request.approved_by_teamlead and request.approved_by_participant):
            raise BadRequestError # попытался сам заапрувить свой запрос - 400 ошибка

        return approve

    async def accept_request(self, request_id, user_id):
        return await self._handle_request_approval(request_id, user_id, approve=True)

    async def reject_request(self, request_id, user_id):
        return await self._handle_request_approval(request_id, user_id, approve=False)
