from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..domain.models.user import UserRead
from ..domain.services.user_services import UserService
from ..infrastructure.db.session import get_session
from ..infrastructure.db.repositories.user_repository_impl import UserRepositoryImpl
from ..infrastructure.db.models.user import UsersDB

def get_user_repository(
    session: AsyncSession = Depends(get_session),
) -> UserRepositoryImpl:
    return UserRepositoryImpl(
        session=session,
        model=UsersDB,
        read_schema=UserRead
    )

def get_user_service(
    repo: UserRepositoryImpl = Depends(get_user_repository),
) -> UserService:
    return UserService(repo)
