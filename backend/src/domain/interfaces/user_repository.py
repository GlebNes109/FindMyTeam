from typing import Any, Protocol, Generic

from backend.src.domain.models.user import UsersRead, UsersCreate, UsersUpdate
from backend.src.domain.interfaces.base_repository import BaseRepository


class UserRepository(BaseRepository[Any, UsersRead, UsersCreate, UsersUpdate], Protocol):
    async def get_by_login(self, login: str) -> UsersRead: ...