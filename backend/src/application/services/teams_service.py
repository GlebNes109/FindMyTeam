from backend.src.domain.interfaces.repositories.teams_repository import TeamsRepository


class TeamsService:
    def __init__(self, repository: TeamsRepository):
        self.repository = repository

    async def add_team(self, team_read):
        return await self.repository.create(team_read)

    async def get_teams(self, event_id):
        return await self.repository.get_all_by_event_id(event_id)
