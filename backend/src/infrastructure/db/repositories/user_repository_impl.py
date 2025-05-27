from select import select

from backend.src.domain.models.user import UserRead, UserCreate, UserUpdate
from backend.src.domain.repositories.user_repository import UserRepository
from backend.src.infrastructure.db.models.user import UsersDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class UserRepositoryImpl(
    UserRepository[UsersDB, UserRead, UserCreate, UserUpdate],
    BaseRepositoryImpl[UsersDB, UserRead, UserCreate, UserUpdate]):

    async def get_by_login(self, login: str) -> UserRead:
        stmt = select(self.model).where(self.model.login == login)
        result = await self.session.execute(stmt)
        obj = result.one()
        # if obj is None:
        #    raise ValueError(f"User with login '{login}' not found")
        return self.read_schema.model_validate(obj, from_attributes=True)