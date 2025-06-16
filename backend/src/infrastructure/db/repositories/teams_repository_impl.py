import uuid
from sqlite3 import IntegrityError

from sqlmodel import select
from sqlalchemy.orm import selectinload

from backend.src.domain.exceptions import ObjectAlreadyExistsError
from backend.src.domain.interfaces.repositories.teams_repository import TeamsRepository
from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.models import CreateModelType, ReadModelType
from backend.src.domain.models.participants import ParticipantsRead
from backend.src.domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate, VacanciesRead
from backend.src.infrastructure.db.db_models.events import EventTracksDB
from backend.src.infrastructure.db.db_models.teams import TeamsDB, TeamMembersDB, TeamVacanciesDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class TeamsRepositoryImpl(
    BaseRepositoryImpl[TeamsDB, TeamsRead, TeamsCreate, TeamsUpdate],
    TeamsRepository):

    async def create(self, obj: TeamsCreate) -> TeamsRead:
        db_obj = self.model(**obj.model_dump())
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
            return self.read_schema.model_validate(db_obj, from_attributes=True)
        except IntegrityError:
            raise ObjectAlreadyExistsError

    async def get_all_by_event_id(self, event_id: str) -> list[TeamsRead]:
        stmt = (
            select(TeamsDB)
            .where(TeamsDB.event_id == event_id)
            .options(
                selectinload(TeamsDB.vacancies),
                selectinload(TeamsDB.members).selectinload(TeamMembersDB.participant)
            )
        )

        result = await self.session.execute(stmt)
        teams = result.scalars().all()

        track_stmt = select(EventTracksDB)
        track_result = await self.session.execute(track_stmt)
        tracks = {track.id: track for track in track_result.scalars().all()}

        teams_read = []
        for team in teams:
            vacancies_read = [
                VacanciesRead(
                    id=vacancy.id,
                    track=EventTracksRead(
                        id=vacancy.event_track_id,
                        name=tracks.get(vacancy.event_track_id).name if tracks.get(
                            vacancy.event_track_id) else "Unknown"
                    ),
                    description=vacancy.description
                )
                for vacancy in team.vacancies
            ] if team.vacancies else None

            members_read = [
                ParticipantsRead(
                    id=member.participant.id,
                    event_id=member.participant.event_id,
                    track=EventTracksRead(
                        id=member.participant.track_id,
                        name=tracks.get(member.participant.track_id).name if tracks.get(
                            member.participant.track_id) else "Unknown"
                    ),
                    event_role=member.participant.event_role,
                    resume=member.participant.resume
                )
                for member in team.members
            ]

            teams_read.append(TeamsRead(
                id=team.id,
                name=team.name,
                description=team.description,
                vacancies=vacancies_read,
                members=members_read
            ))

        return teams_read