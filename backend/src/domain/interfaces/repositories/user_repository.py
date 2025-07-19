from typing import Any, Protocol

from backend.src.domain.models.user import UsersRead, UsersCreate, UsersUpdate
from backend.src.domain.interfaces.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[Any, UsersRead, UsersCreate, UsersUpdate], Protocol):
    async def get_by_login(self, login: str) -> UsersRead: ...

    async def get_users_by_ids(self, ids: list[str]) -> list[UsersRead]: ...