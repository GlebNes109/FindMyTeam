from typing import Any, Protocol, Generic

from backend.src.domain.models.user import UserRead, UserCreate, UserUpdate
from backend.src.domain.interfaces.base_repository import BaseRepository


class UserRepository(BaseRepository[Any, UserRead, UserCreate, UserUpdate], Protocol):
    async def get_by_login(self, login: str) -> UserRead: ...