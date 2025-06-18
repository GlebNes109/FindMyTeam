from typing import Any, Protocol

from backend.src.domain.interfaces.repositories.base_repository import BaseRepository
from backend.src.domain.models.teamrequests import TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate


class TeamRequestsRepository(BaseRepository[Any, TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate], Protocol):
    pass