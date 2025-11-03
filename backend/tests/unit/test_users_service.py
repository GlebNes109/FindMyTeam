import pytest
import re

from domain.models.user import UsersRead, TokenPair
from application.services.user_service import UsersService


class FakeUserRepository:
    async def create(self, new_user):
        return UsersRead(
            id="user-123",
            login=new_user.login,
            email=new_user.email,
            tg_nickname=new_user.tg_nickname,
            password_hash=new_user.password_hash,
            role="USER"
        )

    async def get_by_login(self, login: str):
        if login == "exists":
            return UsersRead(
                id="user-123",
                login=login,
                email="e@e.com",
                tg_nickname=None,
                password_hash="hash",
                role="USER"
            )
        return None

    async def get(self, user_id: str):
        return UsersRead(
            id=user_id,
            login="exists",
            email="e@e.com",
            tg_nickname=None,
            password_hash="hash",
            role="USER"
        )


class FakeTokenCreator:
    async def create_access_token(self, user_id: str) -> str:
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_access_token"

    async def create_refresh_token(self, user_id: str) -> str:
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_refresh_token"

    async def verify_refresh_token(self, token: str) -> str:
        return "user-123"


class FakeHashCreator:
    async def create_hash(self, password: str) -> str:
        # имитация bcrypt-хэша
        return f"$2b$12$fakehash{password}"


class FakeProviderFactory:
    def get(self, provider: str):
        return None


class NewUserApi:
    def __init__(self, login: str, password: str, email: str, tg_nickname: str):
        self.login = login
        self.password = password
        self.email = email
        self.tg_nickname = tg_nickname


@pytest.mark.asyncio
async def test_create_user_generates_tokens_and_hashes_password():
    service = UsersService(
        FakeUserRepository(),
        FakeTokenCreator(),
        FakeHashCreator(),
        FakeProviderFactory()
    )

    req = NewUserApi(
        login="john",
        password="StrongP@ss1",
        email="j@example.com",
        tg_nickname="johnny"
    )

    result: TokenPair = await service.create_user(req)

    assert hasattr(result, "user_id")
    assert hasattr(result, "access_token")
    assert hasattr(result, "refresh_token")

    assert result.user_id == "user-123"

    assert re.match(r"^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$", result.access_token) or result.access_token.startswith("eyJ")
    assert re.match(r"^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$", result.refresh_token) or result.refresh_token.startswith("eyJ")

    assert result.user_id == "user-123"



