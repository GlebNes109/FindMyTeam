from typing import TYPE_CHECKING

from application.services.events_service import EventsService
from domain.interfaces.repositories.teams_repository import TeamsRepository
from domain.models.teams import VacanciesRead, TeamMembersCreate, TeamMembersRead, TeamsDetailsRead
from domain.exceptions import ObjectAlreadyExistsError

from domain.models.teams import TeamsUpdate

from domain.exceptions import AccessDeniedError

from domain.exceptions import ObjectNotFoundError, BadRequestError

if TYPE_CHECKING: # чтобы не было циклического импорта
    from .participants_service import ParticipantsService

class TeamsService:
    def __init__(self, repository: TeamsRepository, event_service: EventsService, participant_service: "ParticipantsService"):
        self.repository = repository
        self.event_service = event_service
        self.participants_service = participant_service

    async def add_team(self, team_read):
        return await self.repository.create(team_read)

    async def check_teamlead(self, user_id, team_id):
        team = await self.get_team(team_id)
        teamlead = await self.participants_service.get_participant(team.teamlead_id)
        #this_user_participants = await self.participants_service.get_participants(
        #    user_id)
        #this_user_participants_ids = [participant.id for participant in this_user_participants]
        if teamlead.user_id == user_id:
            return True

        else:
            return False

    async def get_teams(self, event_id) -> list[TeamsDetailsRead]:
        teams = await self.repository.get_all_by_event_id(event_id)

        # Сбор всех ID участников из всех команд
        all_ids = [pid for team in teams for pid in team.members_ids]

        # Один вызов в participant service чтобы не нагружать бд
        all_participants = await self.participants_service.get_detail_participants_by_ids(all_ids)

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
        members = await self.participants_service.get_detail_participants_by_ids(team.members_ids)
        return TeamsDetailsRead(
            **team.model_dump(),
            members=members
        )

    async def get_team(self, team_id):
        res = await self.repository.get_read_model(team_id)
        if res is None:
            raise ObjectNotFoundError
        return res

    async def create_member(self, create_member: TeamMembersCreate) -> TeamMembersRead:
        team = await self.get_team(create_member.team_id)
        if create_member.participant_id in team.members_ids:
            raise ObjectAlreadyExistsError #в команде уже есть участник такой
        return await self.repository.create_member(create_member)

    async def get_team_by_teamlead_id(self, teamlead_id):
        return await self.repository.get_by_teamlead_id(teamlead_id)

    async def delete_vacancy(self, vacancy_id):
        return await self.repository.delete_vacancy(vacancy_id)

    async def update(self, team_for_update: TeamsUpdate, user_id):
        # Проверка что user является капитаном этой команды
        if await self.check_teamlead(user_id, team_for_update.id):
            await self.repository.update(team_for_update)
        else:
            raise AccessDeniedError # нет прав на изменение команды

    async def delete_vacancy_teamleadcheck(self, vacancy_id, user_id):
        vacancy_read = await self.repository.get_vacancy(vacancy_id) # получить вакансию
        if await self.check_teamlead(user_id, vacancy_read.team_id):
            await self.delete_vacancy(vacancy_id)
            return True
        else:
            raise AccessDeniedError

    async def create_vacancy_teamleadcheck(self, vacancy_create, user_id, team_id):
        if await self.check_teamlead(user_id, team_id):
            try:
                await self.event_service.get_track(vacancy_create.event_track_id)
            except ObjectNotFoundError:
                raise BadRequestError

            return await self.repository.create_vacancy(vacancy_create, team_id)
        else:
            raise AccessDeniedError

    async def delete(self, team_id, user_id):
        if await self.check_teamlead(user_id, team_id):
            await self.repository.delete(team_id)
        else:
            raise AccessDeniedError

    async def delete_team_member(self, team_id, participant_id, user_id):
        if await self.check_teamlead(user_id, team_id):
            await self.repository.delete_team_member(team_id, participant_id)
        else:
            raise AccessDeniedError

    async def leave_team(self, team_id, participant_id, user_id):
        team = await self.get_team(team_id)
        participant = await self.participants_service.get_participant(participant_id)
        if participant.user_id == user_id and participant in team.members_ids:
            if participant.role == "TEAMLEAD":
                await self.repository.delete(team_id) # когда тимлид выходит, вся команда удаляется )
            else:
                await self.repository.delete_team_member(team_id, participant_id)