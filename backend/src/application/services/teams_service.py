import asyncio
import math
from typing import TYPE_CHECKING

from application.services.events_service import EventsService
from domain.interfaces.repositories.teams_repository import TeamsRepository
from domain.models.teams import VacanciesRead, TeamMembersCreate, TeamMembersRead, TeamsDetailsRead, VacanciesDetailsRead
from domain.exceptions import ObjectAlreadyExistsError

from domain.models.teams import TeamsUpdate

from domain.exceptions import AccessDeniedError

from domain.exceptions import ObjectNotFoundError, BadRequestError

from domain.models.teams import TeamsRead

from domain.interfaces.sorter import Sorter

from domain.models.teams import VacanciesWithPagination

if TYPE_CHECKING: # чтобы не было циклического импорта
    from .participants_service import ParticipantsService

class TeamsService:
    def __init__(self, repository: TeamsRepository, event_service: EventsService, participant_service: "ParticipantsService", sorter: Sorter):
        self.repository = repository
        self.event_service = event_service
        self.participants_service = participant_service
        self.sorter = sorter

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

    async def get_teams(self, event_id) -> list[TeamsRead]:
        return await self.repository.get_all_by_event_id(event_id)

    async def get_detailed_teams(self, event_id) -> list[TeamsDetailsRead]:
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
        # проверка что этого участника еще нет в других командах
        teams = await self.repository.get_all_by_event_id(team.event_id)
        for team in teams:
            if create_member.participant_id in team.members_ids:
                raise ObjectAlreadyExistsError # в команде уже есть участник такой
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
            team = await self.get_team(team_id)
            await self.participants_service.change_participant_role(team.teamlead_id)
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
        if participant.user_id == user_id and participant.id in team.members_ids:
            if participant.event_role == "TEAMLEAD":
                await self.participants_service.change_participant_role(participant_id)
                await self.repository.delete_team_member(team_id, participant_id)
                await self.repository.delete(team_id)  # когда тимлид выходит, вся команда удаляется )
            else:
                await self.repository.delete_team_member(team_id, participant_id)

    async def get_event_vacancies(self, event_id, relevant_sort=False, participant_id=None, page=1, per_page=10):
        offset = (page - 1) * per_page
        limit = per_page
        total_count = await self.repository.total_count_for_event(event_id)
        total_pages = math.ceil(total_count / per_page)
        if relevant_sort and participant_id:
            vacancies = await self.sorter.sort_vacancies(event_id, participant_id, limit, offset)
        else:
            vacancies = await self.repository.get_event_vacancies(event_id, limit, offset)


        # сначала собираются таски, потом выполняются в асинхроне все одновременно
        track_tasks = [self.event_service.get_track(vacancy.track_id) for vacancy in vacancies]

        # выполнение всех собранных корутин асинхронно (gather собирает список в том же порядке)
        tracks = await asyncio.gather(*track_tasks)

        teams_tasks = [self.get_team(vacancy.team_id) for vacancy in vacancies]

        # выполнение всех собранных корутин асинхронно (gather собирает список в том же порядке)
        teams = await asyncio.gather(*teams_tasks)

        # маппинг в модели
        vacancies_detailed = [
            VacanciesDetailsRead(
                id=vacancy.id,
                track=track,
                team_id=vacancy.team_id,
                description=vacancy.description,
                team_name=team.name
            )
            for vacancy, track, team in zip(vacancies, tracks, teams)
        ]

        vacancies_with_pagination = VacanciesWithPagination(
            items=vacancies_detailed,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        return vacancies_with_pagination
