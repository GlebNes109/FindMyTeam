from typing import Any, Protocol

from domain.interfaces.repositories.base_repository import BaseRepository
from domain.models.events import EventsCreate, EventsUpdate, EventsRead, EventTracksRead


class EventsRepository(BaseRepository[Any, EventsRead, EventsCreate, EventsUpdate], Protocol):
    async def get_track(self, id: Any) -> EventTracksRead: ...