from typing import Any, Protocol

from backend.src.domain.interfaces.repositories.base_repository import BaseRepository
from backend.src.domain.models.teamrequests import TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate


class TeamRequestsRepository(BaseRepository[Any, TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate], Protocol):
    async def get_all_with_params(self, participant_id, approved_by_teamlead,
                                  approved_by_participant)-> list[TeamRequestsRead]: ...