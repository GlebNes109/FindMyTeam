from sqlmodel import Session, select

import uuid
from sqlmodel import SQLModel
from core.config import settings
from domain.interfaces.hash_creator import HashCreator
from domain.models.user import Role
from infrastructure.db.db_models.user import UsersDB
from infrastructure.db.session import engine, get_session, async_session_maker
from sqlalchemy.ext.asyncio import AsyncSession

async def add_super_admin(hash_creator: HashCreator, session: AsyncSession):
        # SQLModel.metadata.create_all(engine)
        '''res = await session.execute(
            select(UsersDB).where(UsersDB.role == "SUPER_ADMIN")
        )
        obj = res.scalar_one_or_none()
        print(obj)
        if obj is None:
            user_id = str(uuid.uuid4())
            user_db = UsersDB(
                id=user_id,
                login=settings.admin_login,
                password_hash=await hash_creator.create_hash(settings.admin_password),
                email="admin@example.com",
                tg_nickname="superadmin",
                role=Role.SUPER_ADMIN
            )
            session.add(user_db)
            await session.commit()
            print("добавлен")
        await session.close()
        # print("добавлен")'''
        pass

async def create_tables():
    async with engine.begin() as conn:
        pass
        # await conn.run_sync(SQLModel.metadata.create_all)