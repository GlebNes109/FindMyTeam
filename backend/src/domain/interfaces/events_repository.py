from typing import Any, Protocol

from backend.src.domain.interfaces.base_repository import BaseRepository
from backend.src.domain.models.events import EventTracksCreate, EventsCreate, EventsUpdate, EventsRead, EventTracksRead
from backend.src.domain.models.models import CreateModelType, ReadModelType


class EventsRepository(BaseRepository[Any, EventsRead, EventsCreate, EventsUpdate], Protocol):
    async def get_track(self, id: Any) -> EventTracksRead: ...