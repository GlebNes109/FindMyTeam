from typing import Any, Protocol

from backend.src.domain.interfaces.repositories.base_repository import BaseRepository
from backend.src.domain.models.events import EventsCreate, EventsUpdate, EventsRead, EventTracksRead


class EventsRepository(BaseRepository[Any, EventsRead, EventsCreate, EventsUpdate], Protocol):
    async def get_track(self, id: Any) -> EventTracksRead: ...