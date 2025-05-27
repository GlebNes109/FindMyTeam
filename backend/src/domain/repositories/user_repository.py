from typing import Any, Protocol

from backend.src.domain.models.user import UserRead, UserCreate, UserUpdate
from backend.src.domain.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[Any, UserRead, UserCreate, UserUpdate], Protocol):
    async def get_by_login(self, login: str) -> UserRead: ...