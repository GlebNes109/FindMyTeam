from typing import TYPE_CHECKING

from application.services.events_service import EventsService
from domain.interfaces.repositories.teams_repository import TeamsRepository
from domain.models.teams import VacanciesRead, TeamMembersCreate, TeamMembersRead, TeamsDetailsRead
from domain.exceptions import ObjectAlreadyExistsError

if TYPE_CHECKING: # чтобы не было циклического импорта
    from .participants_service import ParticipantsService

class TeamsService:
    def __init__(self, repository: TeamsRepository, event_service: EventsService, participant_service: "ParticipantsService"):
        self.repository = repository
        self.event_service = event_service
        self.participant_service = participant_service

    async def add_team(self, team_read):
        return await self.repository.create(team_read)

    async def get_teams(self, event_id) -> list[TeamsDetailsRead]:
        teams = await self.repository.get_all_by_event_id(event_id)

        # Сбор всех ID участников из всех команд
        all_ids = [pid for team in teams for pid in team.members_ids]

        # Один вызов в participant service чтобы не нагружать бд
        all_participants = await self.participant_service.get_detail_participants_by_ids(all_ids)

        # В словарь по id для быстрого доступа
        participants_by_id = {p.id: p for p in all_participants}

        # Это сделано для того, чтобы не вызывать get_detail_participants_by_ids в цикле, чтобы достать все одним запросом

        detail_teams = []
        for team in teams:
            participants = [participants_by_id[pid] for pid in team.members_ids if pid in participants_by_id]
            detail_teams.append(
                TeamsDetailsRead(
                    **team.model_dump(),
                    members=participants
                )
            )

        return detail_teams

    async def get_vacancy(self, vacancy_id):
        basic_vacancy = await self.repository.get_vacancy(vacancy_id)
        track = await self.event_service.get_track(basic_vacancy.track_id)
        return VacanciesRead(
            track=track,
            **basic_vacancy.model_dump()
        )
    async def get_detailed(self, team_id):
        team = await self.repository.get_read_model(team_id)
        members = await self.participant_service.get_detail_participants_by_ids(team.members_ids)
        return TeamsDetailsRead(
            **team.model_dump(),
            members=members
        )

    async def get_team(self, team_id):
        return await self.repository.get_read_model(team_id)

    async def create_member(self, create_member: TeamMembersCreate) -> TeamMembersRead:
        team = await self.get_team(create_member.team_id)
        if create_member.participant_id in team.members_ids:
            raise ObjectAlreadyExistsError #в команде уже есть участник такой
        return await self.repository.create_member(create_member)

    async def get_team_by_teamlead_id(self, teamlead_id):
        return await self.repository.get_by_teamlead_id(teamlead_id)

    async def delete_vacancy(self, vacancy_id):
        return await self.repository.delete_vacancy(vacancy_id)