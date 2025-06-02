from fastapi import HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from ..application.services.events_service import EventsService
from ..application.services.user_service import UserService
from ..core.config import settings
from ..domain.interfaces.events_repository import EventsRepository
from ..domain.interfaces.hash_creator import HashCreator
from ..domain.interfaces.token_creator import TokenCreator
from ..domain.interfaces.user_repository import UserRepository
from ..domain.models.events import EventsRead
from ..domain.models.user import UsersRead
from ..infrastructure.db.db_models.events import EventsDB
from ..infrastructure.db.repositories.events_repository_impl import EventsRepositoryImpl
from ..infrastructure.db.session import get_session
from ..infrastructure.db.repositories.user_repository_impl import UserRepositoryImpl
from ..infrastructure.db.db_models.user import UsersDB
from ..infrastructure.hash_creator_impl import sha256HashCreator
from ..infrastructure.token_creator_impl import JWTTokenCreator

def get_user_repository(
    session: AsyncSession = Depends(get_session),
) -> UserRepositoryImpl:
    return UserRepositoryImpl(
        session=session,
        model=UsersDB,
        read_schema=UsersRead
    )

def get_hash_creator() -> HashCreator:
    return sha256HashCreator()

def get_token_creator() -> TokenCreator:
    return JWTTokenCreator()

def get_user_service(
    token_creator: TokenCreator= Depends(get_token_creator),
    hash_creator: HashCreator = Depends(get_hash_creator),
    repo: UserRepository = Depends(get_user_repository),
    ) -> UserService:
    return UserService(repo, token_creator, hash_creator)

def get_events_repository(
    session: AsyncSession = Depends(get_session),
    ) -> EventsRepositoryImpl:
    return EventsRepositoryImpl(
        session=session,
        model=EventsDB,
        read_schema=EventsRead
    )

def get_event_service(
    repo: EventsRepository = Depends(get_events_repository),
    user_service: UserService = Depends(get_user_service)
    ) -> EventsService:
    return EventsService(repo, user_service)

def get_token(request: Request):
    headers = request.headers
    a = str(headers.get("Authorization"))
    return a[7:]

async def get_user_id(token: str = Depends(get_token), repository: UserRepository = Depends(get_user_repository)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if not await repository.get(user_id):
            raise jwt.PyJWTError
        return user_id

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Пользователь не авторизован"
        )