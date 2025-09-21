from fastapi import HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from application.services.events_service import EventsService
from application.services.participants_service import ParticipantsService
from application.services.team_requests_service import TeamRequestsService
from application.services.teams_service import TeamsService
from application.services.user_service import UsersService
from core.config import settings
from domain.interfaces.repositories.events_repository import EventsRepository
from domain.interfaces.hash_creator import HashCreator
from domain.interfaces.repositories.participants_repository import ParticipantsRepository
from domain.interfaces.repositories.team_requests_repository import TeamRequestsRepository
from domain.interfaces.repositories.teams_repository import TeamsRepository
from domain.interfaces.token_creator import TokenCreator
from domain.interfaces.repositories.user_repository import UserRepository
from domain.models.events import EventsRead
from domain.models.participants import ParticipantsBasicRead
from domain.models.teamrequests import TeamRequestsRead
from domain.models.teams import TeamsRead, TeamsBasicRead
from domain.models.user import UsersRead
from infrastructure.db.db_models.events import EventsDB
from infrastructure.db.db_models.participants import ParticipantsDB
from infrastructure.db.db_models.teamrequests import TeamRequestsDB
from infrastructure.db.db_models.teams import TeamsDB
from infrastructure.db.repositories.events_repository_impl import EventsRepositoryImpl
from infrastructure.db.repositories.participants_repository_impl import ParticipantsRepositoryImpl
from infrastructure.db.repositories.team_requests_repository_impl import TeamRequestsRepositoryImpl
from infrastructure.db.repositories.teams_repository_impl import TeamsRepositoryImpl
from infrastructure.db.session import get_session
from infrastructure.db.repositories.user_repository_impl import UserRepositoryImpl
from infrastructure.db.db_models.user import UsersDB
from infrastructure.hash_creator_impl import sha256HashCreator
from infrastructure.token_creator_impl import JWTTokenCreator

from domain.interfaces.oauth_provider import OAuthProvider

from infrastructure.oauth.oauth_provider_factory import OAuthProviderFactory

from infrastructure.oauth.oauth_provider_google import GoogleOAuthProvider

from infrastructure.oauth.registry import oauth

from domain.interfaces.sorter import Sorter

from infrastructure.sorter_impl import SorterImpl


# from infrastructure.oauth.oauth_provider_google import GoogleOAuthProvider


def get_user_repository(
    session: AsyncSession = Depends(get_session),
) -> UserRepositoryImpl:
    return UserRepositoryImpl(
        session=session,
        model=UsersDB,
        read_schema=UsersRead
    )

def get_participants_repository(
    session: AsyncSession = Depends(get_session),
) -> ParticipantsRepositoryImpl:
    return ParticipantsRepositoryImpl(
        session=session,
        model=ParticipantsDB,
        read_schema=ParticipantsBasicRead
    )

def get_oauth_provider_factory() -> OAuthProviderFactory:
    return OAuthProviderFactory(oauth)

def get_teams_repository(
    session: AsyncSession = Depends(get_session),
    ) -> TeamsRepositoryImpl:
    return TeamsRepositoryImpl(
        session=session,
        model=TeamsDB,
        read_schema=TeamsBasicRead
    )

def get_sorter(
        teams_repo: TeamsRepository = Depends(get_teams_repository),
        participant_repo: ParticipantsRepository = Depends(get_participants_repository)
) -> Sorter:
    return SorterImpl(
        teams_repo,
        participant_repo
    )

def get_hash_creator() -> HashCreator:
    return sha256HashCreator()

def get_token_creator(repo: UserRepository = Depends(get_user_repository)) -> TokenCreator:
    return JWTTokenCreator(secret_key=settings.secret_key, algorithm=settings.algorithm, repository=repo)

def get_user_service(
    token_creator: TokenCreator= Depends(get_token_creator),
    hash_creator: HashCreator = Depends(get_hash_creator),
    repo: UserRepository = Depends(get_user_repository),
    provider_factory: OAuthProviderFactory = Depends(get_oauth_provider_factory),
    sorter: Sorter = Depends(get_sorter)
    ) -> UsersService:
    return UsersService(repo, token_creator, hash_creator, provider_factory)

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
    user_service: UsersService = Depends(get_user_service)
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

def get_teams_requests_repository(
    session: AsyncSession = Depends(get_session),
    ) -> TeamRequestsRepositoryImpl:
    return TeamRequestsRepositoryImpl(
        session=session,
        model=TeamRequestsDB,
        read_schema=TeamRequestsRead
    )

def get_participants_service(
    repo: ParticipantsRepository = Depends(get_participants_repository),
    teams_repo: TeamsRepository = Depends(get_teams_repository),
    event_service: EventsService = Depends(get_event_service),
    user_service: UsersService = Depends(get_user_service),
    sorter: Sorter = Depends(get_sorter)
    ) -> ParticipantsService:
    return ParticipantsService(repo, teams_repo, event_service, user_service, sorter)

def get_teams_service(
    repo: TeamsRepository = Depends(get_teams_repository),
    event_service: EventsService = Depends(get_event_service),
    participants_service: ParticipantsService = Depends(get_participants_service),
    sorter: Sorter = Depends(get_sorter)
) -> TeamsService:
    return TeamsService(repo, event_service, participants_service, sorter)

def get_team_requests_service(
    repo: TeamRequestsRepository = Depends(get_teams_requests_repository),
    event_service: EventsService = Depends(get_event_service),
    teams_service: TeamsService = Depends(get_teams_service),
    participants_service: ParticipantsService = Depends(get_participants_service)
) -> TeamRequestsService:
    return TeamRequestsService(repo, teams_service, participants_service, event_service)