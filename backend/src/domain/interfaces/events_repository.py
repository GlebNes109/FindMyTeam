from typing import Any, Protocol

from backend.src.domain.interfaces.base_repository import BaseRepository
from backend.src.domain.models.events import EventTracksCreate, EventsCreate, EventsUpdate, EventsRead
from backend.src.domain.models.models import CreateModelType, ReadModelType


class EventsRepository(BaseRepository[Any, EventsRead, EventsCreate, EventsUpdate], Protocol):
    pass