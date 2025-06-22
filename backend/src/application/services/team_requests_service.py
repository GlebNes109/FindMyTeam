from backend.src.application.services.events_service import EventsService
from backend.src.application.services.participants_service import ParticipantsService
from backend.src.application.services.teams_service import TeamsService
from backend.src.domain.exceptions import BadRequestError, AccessDeniedError
from backend.src.domain.interfaces.repositories.team_requests_repository import TeamRequestsRepository
from backend.src.domain.models.participants import EventRole
from backend.src.domain.models.teamrequests import TeamRequestsCreate, TeamRequestsPartialCreate, TeamRequestsUpdate
from backend.src.domain.models.teams import TeamMembersCreate


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
        this_user_participants = await self.participants_service.get_event_participants(team.event_id) # по команде получить участия юзера (пользователя системы, который инициировал запрос)
        this_user_participants_ids = [participant.id for participant in this_user_participants] # айди его участия в удобном формате списка

        # если отклик -> user_id соотвествует указанному participant
        if user_id == participant.user_id and participant.event_role == EventRole.PARTICIPANT: # отклик - participant это и есть юзер.
            teams_create = TeamRequestsCreate(
                # approved_by_teamlead=False,
                approved_by_participant=True,
                **team_request_partial_create.model_dump()
            )

        # если приглашение -> user_id соотвествует тимлиду в команде, в которой вакансия
        elif user_id != participant.user_id and participant.event_role == EventRole.PARTICIPANT and team.teamlead_id in this_user_participants_ids: # приглашение - participant не является юзером, однако user в числе прочих регистраций зареган на этот ивент как тимлид
            teams_create = TeamRequestsCreate(
                # approved_by_teamlead=False,
                approved_by_participant=True,
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

        team_request = await self.repository.create(teams_create)
        return team_request
        # TODO по возможности вынести логику в domain модель
     # TODO сделать проверку что participant не состоит в командах (можно приглашать)

    async def get_outgoing(self, participant_id, user_id):
        participant = await self.participants_service.get_participant(participant_id)

        # проверка, что participant_id принадлежит юзеру
        if not participant.check_user_id(user_id):
            raise BadRequestError
        # team_requests = []
        if participant.event_role == EventRole.PARTICIPANT:
            team_requests = await self.repository.get_all_with_params(participant_id, approved_by_participant=True, approved_by_teamlead=None)

        elif participant.event_role == EventRole.TEAMLEAD: # None - значит еще не просмотрена
            team_requests = await self.repository.get_all_with_params(participant_id, approved_by_participant=None, approved_by_teamlead=True)

        # если у participant нет роли, то 500 ошибка
        return team_requests

    async def get_incoming(self, participant_id, user_id):
        participant = await self.participants_service.get_participant(participant_id)

        # проверка, что participant_id принадлежит юзеру
        if not participant.check_user_id(user_id):
            raise BadRequestError
        # team_requests = []
        if participant.event_role == EventRole.PARTICIPANT:
            team_requests = await self.repository.get_all_with_params(participant_id, approved_by_participant=None,
                                                                      approved_by_teamlead=True)

        elif participant.event_role == EventRole.TEAMLEAD:
            team_requests = await self.repository.get_all_with_params(participant_id, approved_by_participant=None,
                                                                      approved_by_teamlead=False)

        # если у participant нет роли, то 500 ошибка
        return team_requests

    async def accept_request(self, request_id, user_id):
        request = await self.repository.get(request_id)
        participant = await self.participants_service.get_participant(request.participant_id)
        vacancy_read = await self.teams_service.get_vacancy(request.vacancy_id)  # получить вакансию
        team = await self.teams_service.get_team(vacancy_read.team_id)
        this_user_participants = await self.participants_service.get_event_participants(team.event_id)  # по команде получить участия юзера (пользователя системы, который инициировал запрос)
        this_user_participants_ids = [participant.id for participant in this_user_participants]
        if user_id != participant.user_id and participant.event_role == EventRole.PARTICIPANT and team.teamlead_id in this_user_participants_ids:
            request.approved_by_teamlead = True
        # TODO вынести проверку на тимлида в отдельный метод или в модель

        elif participant.user_id == user_id and participant.event_role == EventRole.PARTICIPANT:
            request.approved_by_participant = True

        else:
            raise AccessDeniedError # нет прав доступа чтобы апрувнуть приглашение

        if request.approved_by_teamlead and request.approved_by_participant:
            await self.teams_service.create_member(TeamMembersCreate(
                participant_id=request.participant_id,
                team_id=vacancy_read.team_id
            ))
            await self.repository.update(TeamRequestsUpdate.model_validate(request, from_attributes=True))  # в базу сохраняется уже не активный отклик, чтобы потом можно было посмотреть старые отклики
            return True
        await self.teams_service.create_member(TeamMembersCreate(
            participant_id=request.participant_id,
            team_id=vacancy_read.team_id
        ))
        raise BadRequestError # попытался сам заапрувить свой запрос - 400 ошибка