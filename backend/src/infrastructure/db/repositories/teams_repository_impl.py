import uuid
from typing import Any

from sqlmodel import select
from sqlalchemy.orm import selectinload

from backend.src.domain.exceptions import ObjectAlreadyExistsError, ObjectNotFoundError
from backend.src.domain.interfaces.repositories.teams_repository import TeamsRepository
from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.models import CreateModelType, ReadModelType
from backend.src.domain.models.participants import ParticipantsRead
from backend.src.domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate, VacanciesRead, TeamsBasicRead, \
    VacanciesBasicRead, TeamMembersCreate, TeamMembersRead
from backend.src.infrastructure.db.db_models.events import EventTracksDB
from backend.src.infrastructure.db.db_models.participants import ParticipantsDB
from backend.src.infrastructure.db.db_models.teams import TeamsDB, TeamMembersDB, TeamVacanciesDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl
from sqlalchemy.exc import IntegrityError, NoResultFound
from asyncpg.exceptions import UniqueViolationError


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
                .selectinload(TeamMembersDB.participant)
            )
        )
        result = await self.session.execute(stmt)
        teams = result.scalars().all()

        track_stmt = select(EventTracksDB)
        track_result = await self.session.execute(track_stmt)
        tracks = {track.id: track for track in track_result.scalars().all()} # в словарь, чтобы потом по id доставать

        teams_read = []
        for team in teams:
            vacancies_read = [
                VacanciesRead(
                    id=vacancy.id,
                    track=EventTracksRead(
                        id=vacancy.event_track_id,
                        name=tracks.get(vacancy.event_track_id).name,
                        event_id=event_id
                    ),
                    description=vacancy.description,
                    team_id=team.id
                )
                for vacancy in team.vacancies
            ] if team.vacancies else []

            members_read = []
            for member in team.members:
                if member.participant is None:
                    # print(member)
                    continue

                members_read.append(ParticipantsRead(
                    id=member.participant.id,
                    user_id=member.participant.user_id,
                    event_id=member.participant.event_id,
                    track=EventTracksRead(
                        id=member.participant.track_id,
                        name=tracks.get(member.participant.track_id).name,
                        event_id=member.participant.event_id
                    ),
                    event_role=member.participant.event_role,
                    resume=member.participant.resume
                ))

            teams_read.append(TeamsRead(
                id=team.id,
                name=team.name,
                description=team.description,
                vacancies=vacancies_read,
                members=members_read,
                event_id=event_id
            ))

        return teams_read

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
