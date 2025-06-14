import uuid
from sqlite3 import IntegrityError
from sqlmodel import select
from sqlalchemy.orm import selectinload

from backend.src.domain.exceptions import ObjectAlreadyExistsError, ObjectNotFoundError
from backend.src.domain.interfaces.events_repository import EventsRepository
from backend.src.domain.models.events import EventsRead, EventsCreate, EventsUpdate, EventTracksRead
from backend.src.infrastructure.db.db_models.events import EventsDB, EventTracksDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class EventsRepositoryImpl(
    BaseRepositoryImpl[EventsDB, EventsRead, EventsCreate, EventsUpdate],
    EventsRepository):
    async def create(self, obj: EventsCreate) -> EventsRead:
        event_id = str(uuid.uuid4())
        event_db = EventsDB(
            id=event_id,
            name=obj.name,
            description=obj.description,
            start_date=obj.start_date,
            end_date=obj.end_date
        )

        event_tracks_db: list[EventTracksDB] = []
        for track in obj.event_tracks:
            event_track = EventTracksDB(
                id=str(uuid.uuid4()),
                event_id=event_id,
                name=track.name
            )
            event_tracks_db.append(event_track)
            self.session.add(event_track)

        self.session.add(event_db)

        try:
            await self.session.commit()
            await self.session.refresh(event_db)

            # event_tracks в формат бизнес-модели
            event_tracks = [
                EventTracksRead(**track.model_dump())
                for track in event_tracks_db
            ]

            return EventsRead(
                id=event_db.id,
                name=event_db.name,
                description=event_db.description,
                start_date=event_db.start_date,
                end_date=event_db.end_date,
                event_tracks=event_tracks,
            )

        except IntegrityError:
            raise ObjectAlreadyExistsError

    async def get(self, id: str) -> EventsRead:
        stmt = (
            select(EventsDB)
            .where(EventsDB.id == id)
            .options(selectinload(EventsDB.event_tracks))
        )
        result = await self.session.execute(stmt)
        event_db = result.scalar_one_or_none()
        if not event_db:
            raise ObjectNotFoundError

        return EventsRead(
            id=event_db.id,
            name=event_db.name,
            description=event_db.description,
            start_date=event_db.start_date,
            end_date=event_db.end_date,
            event_tracks=[
                EventTracksRead(id=track.id, name=track.name)
                for track in event_db.event_tracks
            ]
        )

    async def get_all(self, limit: int = 10, offset: int = 0) -> list[EventsRead]:
        stmt = (
            select(EventsDB)
            .options(selectinload(EventsDB.event_tracks))
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        events = result.scalars().unique().all()

        return [
            EventsRead(
                id=event.id,
                name=event.name,
                description=event.description,
                start_date=event.start_date,
                end_date=event.end_date,
                event_tracks=[
                    EventTracksRead(id=track.id, name=track.name)
                    for track in event.event_tracks
                ]
            )
            for event in events
        ]

    async def get_track(self, id: str) -> EventTracksRead:
        stmt = (
            select(EventTracksDB)
            .where(EventTracksDB.id == id)
        )
        result = await self.session.execute(stmt)
        track_db = result.scalar_one_or_none()
        if not track_db:
            raise ObjectNotFoundError

        return EventTracksRead(**track_db.model_dump())
