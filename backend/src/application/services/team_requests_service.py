from backend.src.application.services.events_service import EventsService
from backend.src.application.services.participants_service import ParticipantsService
from backend.src.application.services.teams_service import TeamsService
from backend.src.domain.exceptions import BadRequestError
from backend.src.domain.interfaces.repositories.team_requests_repository import TeamRequestsRepository
from backend.src.domain.models.participants import EventRole
from backend.src.domain.models.teamrequests import TeamRequestsCreate, TeamRequestsPartialCreate


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
                approved_by_teamlead=False,
                approved_by_participant=True,
                **team_request_partial_create.model_dump()
            )

        # если приглашение -> user_id соотвествует тимлиду в команде, в которой вакансия
        elif user_id != participant.user_id and participant.event_role == EventRole.PARTICIPANT and team.teamlead_id in this_user_participants_ids: # приглашение - participant не является юзером, однако user в числе прочих регистраций зареган на этот ивент как тимлид
            teams_create = TeamRequestsCreate(
                approved_by_teamlead=False,
                approved_by_participant=True,
                **team_request_partial_create.model_dump()
            )

        else:
            raise BadRequestError

        # проверка, подходит ли трек participant под вакансию, на которую он собирается
        if vacancy_read.track_id != participant.track.id:
            raise BadRequestError

        # проверка, что все действие происходит в рамках одного ивента (то есть participant и vacancy на одном ивенте)
        if team.event_id != participant.event_id:
            raise BadRequestError

        team_request = await self.repository.create(teams_create)
        return team_request