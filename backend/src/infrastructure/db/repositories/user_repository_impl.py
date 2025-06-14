from sqlalchemy import select

from backend.src.domain.exceptions import ObjectNotFoundError
from backend.src.domain.models.user import UsersRead, UsersCreate, UsersUpdate
from backend.src.domain.interfaces.user_repository import UserRepository
from backend.src.infrastructure.db.db_models.user import UsersDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class UserRepositoryImpl(
    BaseRepositoryImpl[UsersDB, UsersRead, UsersCreate, UsersUpdate],
    UserRepository):

    async def get_by_login(self, login: str) -> UsersRead:
        stmt = select(self.model).where(self.model.login == login)
        result = await self.session.execute(stmt)
        obj = result.scalar_one_or_none()
        if obj is None:
            raise ObjectNotFoundError
        return self.read_schema.model_validate(obj, from_attributes=True)
