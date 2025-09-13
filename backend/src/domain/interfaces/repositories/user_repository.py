from typing import Any, Protocol

from domain.models.user import UsersRead, UsersCreate, UsersUpdate
from domain.interfaces.repositories.base_repository import BaseRepository

from domain.models.user import OAuthAccountCreate


class UserRepository(BaseRepository[Any, UsersRead, UsersCreate, UsersUpdate], Protocol):
    async def get_by_login(self, login: str) -> UsersRead: ...

    async def get_users_by_ids(self, ids: list[str]) -> list[UsersRead]: ...

    async def get_by_provider_id(self, provider: str, provider_id: str) -> UsersRead: ...

    async def create_with_oauth(self, new_user: OAuthAccountCreate) -> UsersRead: ...