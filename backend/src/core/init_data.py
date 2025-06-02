from sqlmodel import Session, select

import uuid

from backend.src.core.config import settings
from backend.src.domain.interfaces.hash_creator import HashCreator
from backend.src.domain.models.user import Role
from backend.src.infrastructure.db.db_models.user import UsersDB
from backend.src.infrastructure.db.session import engine, get_session, async_session_maker
from sqlalchemy.ext.asyncio import AsyncSession

async def add_super_admin(hash_creator: HashCreator, session: AsyncSession):
        res = await session.execute(
            select(UsersDB).where(UsersDB.role == "SUPER_ADMIN")
        )
        obj = res.scalar_one_or_none()
        print(obj)
        if obj is None:
            user_id = str(uuid.uuid4())
            user_db = UsersDB(
                id=user_id,
                login=settings.admin_login,
                password_hash=hash_creator.create_hash(settings.admin_password),
                email="admin@example.com",
                tg_nickname="superadmin",
                role=Role.SUPER_ADMIN
            )
            session.add(user_db)
            await session.commit()
            print("добавлен")
        await session.close()
        # print("добавлен")

