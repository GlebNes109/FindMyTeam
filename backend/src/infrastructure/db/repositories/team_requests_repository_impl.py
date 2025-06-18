from typing import Any

from backend.src.domain.interfaces.repositories.team_requests_repository import TeamRequestsRepository
from backend.src.domain.models.teamrequests import TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class TeamRequestsRepositoryImpl(BaseRepositoryImpl[Any, TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate],
                                 TeamRequestsRepository):
    pass