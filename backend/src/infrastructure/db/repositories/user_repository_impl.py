import uuid

from sqlalchemy import select

from domain.exceptions import ObjectNotFoundError
from domain.models.user import UsersRead, UsersCreate, UsersUpdate
from domain.interfaces.repositories.user_repository import UserRepository
from infrastructure.db.db_models.user import UsersDB
from infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl
from sqlalchemy.exc import IntegrityError
from infrastructure.db.db_models.user import OauthAccountsDB

from domain.models.user import OAuthAccountCreate

from domain.exceptions import ObjectAlreadyExistsError


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

    async def get_by_provider_id(self, provider: str, provider_id: str) -> UsersRead:
        stmt = (
            select(UsersDB)
            .join(OauthAccountsDB, UsersDB.id == OauthAccountsDB.user_id)
            .where(
                OauthAccountsDB.provider.ilike(provider),
                OauthAccountsDB.provider_id == provider_id
            )
        )
        result = await self.session.execute(stmt)
        obj = result.scalar_one_or_none()
        if obj is None:
            raise ObjectNotFoundError
        return self.read_schema.model_validate(obj, from_attributes=True)

    async def create_with_oauth(self, new_user: OAuthAccountCreate) -> UsersRead:
        db_user = UsersDB(
            id=str(uuid.uuid4()),
            login=new_user.login,
            password_hash=None,
            email=new_user.email,
            tg_nickname=new_user.tg_nickname,
        )
        oauth_account = OauthAccountsDB(
            user_id=db_user.id,
            provider=new_user.provider,
            provider_id=new_user.provider_id
        )
        try:
            self.session.add(db_user)
            self.session.add(oauth_account)
            await self.session.commit()
            await self.session.refresh(db_user)
            return self.read_schema.model_validate(db_user, from_attributes=True)
        except IntegrityError as e:
            # print(e)
            if e.orig.sqlstate == '23505':
                raise ObjectAlreadyExistsError from e
            else:
                raise
