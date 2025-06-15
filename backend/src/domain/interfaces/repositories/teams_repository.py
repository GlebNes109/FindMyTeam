from typing import Any, Protocol

from backend.src.domain.interfaces.repositories.base_repository import BaseRepository
from backend.src.domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate


class TeamsRepository(BaseRepository[Any, TeamsRead, TeamsCreate, TeamsUpdate], Protocol):
    pass

    async def get_all_by_event_id(self, event_id: Any): ...