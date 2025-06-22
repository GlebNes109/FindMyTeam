from backend.src.application.services.events_service import EventsService
from backend.src.domain.interfaces.repositories.teams_repository import TeamsRepository
from backend.src.domain.models.teams import VacanciesRead, TeamMembersCreate, TeamMembersRead


class TeamsService:
    def __init__(self, repository: TeamsRepository, event_service: EventsService):
        self.repository = repository
        self.event_service = event_service

    async def add_team(self, team_read):
        return await self.repository.create(team_read)

    async def get_teams(self, event_id):
        return await self.repository.get_all_by_event_id(event_id)

    async def get_vacancy(self, vacancy_id):
        basic_vacancy = await self.repository.get_vacancy(vacancy_id)
        track = await self.event_service.get_track(basic_vacancy.track_id)
        return VacanciesRead(
            track=track,
            **basic_vacancy.model_dump()
        )

    async def get_team(self, team_id):
        return await self.repository.get(team_id)

    async def create_member(self, create_member: TeamMembersCreate) -> TeamMembersRead:
        # здесь нет никаких проверок, потому что team_requests сервис гарантирует что все данные будут проверены
        return await self.repository.create_member(create_member)