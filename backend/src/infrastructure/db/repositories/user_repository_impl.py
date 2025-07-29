from sqlalchemy import select

from domain.exceptions import ObjectNotFoundError
from domain.models.user import UsersRead, UsersCreate, UsersUpdate
from domain.interfaces.repositories.user_repository import UserRepository
from infrastructure.db.db_models.user import UsersDB
from infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


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

    async def get_users_by_ids(self, ids: list[str]) -> list[UsersRead]:
        stmt = select(UsersDB).where(UsersDB.id.in_(ids))
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]
