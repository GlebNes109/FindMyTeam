import uuid
from typing import Any

from sqlmodel import select, delete
from sqlalchemy.orm import selectinload

from domain.exceptions import ObjectAlreadyExistsError, ObjectNotFoundError
from domain.interfaces.repositories.teams_repository import TeamsRepository
from domain.models.events import EventTracksRead
from domain.models.models import CreateModelType, ReadModelType
from domain.models.participants import ParticipantsRead
from domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate, VacanciesRead, TeamsBasicRead, \
    VacanciesBasicRead, TeamMembersCreate, TeamMembersRead
from infrastructure.db.db_models.events import EventTracksDB
from infrastructure.db.db_models.participants import ParticipantsDB
from infrastructure.db.db_models.teams import TeamsDB, TeamMembersDB, TeamVacanciesDB
from sqlalchemy.exc import IntegrityError, NoResultFound
from asyncpg.exceptions import UniqueViolationError

from infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class TeamsRepositoryImpl(
    BaseRepositoryImpl[TeamsDB, TeamsBasicRead, TeamsCreate, TeamsUpdate],
    TeamsRepository):

    async def create(self, obj: TeamsCreate) -> TeamsBasicRead:
        db_obj = self.model(
            id=str(uuid.uuid4()),
            name=obj.name,
            description=obj.description,
            event_id=obj.event_id,
            teamlead_id=obj.teamlead_id
        ) #маппинг вручную т к есть вложенные модели
        db_obj.id = str(uuid.uuid4())
        try:
            self.session.add(db_obj)

            if obj.vacancies:
                for vacancy in obj.vacancies:
                    vacancy_db = TeamVacanciesDB(
                        id=str(uuid.uuid4()),
                        team_id=db_obj.id,
                        event_track_id=vacancy.event_track_id,
                        description=vacancy.description
                    )
                    self.session.add(vacancy_db)

            # добавление тимлида
            team_member = TeamMembersDB(
                id=str(uuid.uuid4()),
                team_id=db_obj.id,
                participant_id=obj.teamlead_id
            )
            self.session.add(team_member)

            await self.session.commit()
            await self.session.refresh(db_obj)
            #await self.session.refresh(team_member)
            #await self.session.refresh(vacancy_db)
            # ЯВНАЯ ЗАГРУЗКА ОТНОШЕНИЙ ПЕРЕД ВАЛИДАЦИЕЙ
            stmt = (
                select(TeamsDB)
                .where(TeamsDB.id == db_obj.id)
                .options(
                    selectinload(TeamsDB.vacancies),
                    selectinload(TeamsDB.members).selectinload(TeamMembersDB.participant)
                )
            )
            result = await self.session.execute(stmt)
            loaded_team = result.scalars().one()

            return TeamsBasicRead.model_validate(db_obj, from_attributes=True)
        except IntegrityError:
            raise ObjectAlreadyExistsError

    async def get_all_by_event_id(self, event_id: str) -> list[TeamsRead]:
        stmt = (
            select(TeamsDB)
            .where(TeamsDB.event_id == event_id)
            .options(
                selectinload(TeamsDB.vacancies),
                selectinload(TeamsDB.members)
            )
        )
        result = await self.session.execute(stmt)
        teams = result.scalars().all()

        track_stmt = select(EventTracksDB)
        track_result = await self.session.execute(track_stmt)
        tracks = {track.id: track for track in track_result.scalars().all()} # в словарь, чтобы потом по id доставать

        return [await self._assemble_team_read(team, tracks) for team in teams]

    async def get_vacancy(self, vacancy_id: Any) -> VacanciesBasicRead:
        stmt = select(TeamVacanciesDB).where(TeamVacanciesDB.id == vacancy_id)
        result = await self.session.execute(stmt)
        try:
            obj = result.scalar_one()
            vacancy = VacanciesBasicRead(
                id=obj.id,
                track_id=obj.event_track_id,
                description=obj.description,
                team_id=obj.team_id
            )
            return vacancy
        except NoResultFound:
            raise ObjectNotFoundError

    async def create_member(self, obj: TeamMembersCreate) -> TeamMembersRead:
        db_obj = TeamMembersDB(**obj.model_dump())
        db_obj.id = str(uuid.uuid4())
        try:
            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
            return TeamMembersRead.model_validate(db_obj, from_attributes=True)
        except IntegrityError as e:
            if isinstance(e.orig, UniqueViolationError):
                raise ObjectAlreadyExistsError
            raise

    async def get_by_teamlead_id(self, teamlead_id: Any) -> TeamsRead:
        stmt = (
            select(TeamsDB)
            .where(TeamsDB.teamlead_id == teamlead_id)
            .options(
                selectinload(TeamsDB.vacancies),
                selectinload(TeamsDB.members)
            )
        )
        result = await self.session.execute(stmt)
        team = result.scalar_one_or_none()

        track_stmt = select(EventTracksDB)
        track_result = await self.session.execute(track_stmt)
        tracks = {track.id: track for track in track_result.scalars().all()}  # в словарь, чтобы потом по id доставать

        return await self._assemble_team_read(team, tracks)

    async def get_read_model(self, id: Any) -> TeamsRead:
        stmt = (
            select(TeamsDB)
            .where(TeamsDB.id == id)
            .options(
                selectinload(TeamsDB.vacancies),
                selectinload(TeamsDB.members)
            )
        )
        result = await self.session.execute(stmt)
        team = result.scalar_one_or_none()

        track_stmt = select(EventTracksDB)
        track_result = await self.session.execute(track_stmt)
        tracks = {track.id: track for track in track_result.scalars().all()}  # в словарь, чтобы потом по id доставать

        return await self._assemble_team_read(team, tracks)

    async def _assemble_team_read(self, team: TeamsDB, tracks: dict[str, EventTracksDB]) -> TeamsRead:
        vacancies_read = [
            VacanciesRead(
                id=vacancy.id,
                track=EventTracksRead(
                    id=vacancy.event_track_id,
                    name=tracks.get(vacancy.event_track_id).name,
                    event_id=team.event_id
                ),
                description=vacancy.description,
                team_id=team.id
            )
            for vacancy in team.vacancies or []
        ]

        members_ids = [member.participant_id for member in team.members]

        return TeamsRead(
            id=team.id,
            name=team.name,
            description=team.description,
            vacancies=vacancies_read,
            members_ids=members_ids,
            event_id=team.event_id,
            teamlead_id=team.teamlead_id
        )

    async def delete_vacancy(self, id: Any) -> bool:
        await self.get_vacancy(id)  # проверка что существует (чтобы не удаляли по нескольку раз одно и то же)))
        await self.session.execute(delete(TeamVacanciesDB).where(TeamVacanciesDB == id))
        await self.session.commit()
        return True