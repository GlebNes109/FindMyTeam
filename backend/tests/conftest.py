import pytest
from typing import Any
from fastapi import FastAPI
from httpx import AsyncClient
 
from main import app as real_app
from api.dependencies import get_user_service
from domain.models.user import TokenPair, UsersRead, Role
import httpx

from infrastructure.db.session import engine

from core.init_data import create_tables


class FakeUsersService:
 async def create_user(self, new_user_api: Any) -> TokenPair:
     return TokenPair(access_token="access_test", refresh_token="refresh_test", user_id="user-1")

 async def sign_in_user(self, user: Any) -> TokenPair:
     return TokenPair(access_token="access_test", refresh_token="refresh_test", user_id="user-1")

 async def get_user(self, user_id: str) -> UsersRead:
     return UsersRead(id=user_id, login="john", email="john@example.com", tg_nickname=None, password_hash=None, role=Role.USER)


@pytest.fixture()
def app() -> FastAPI:
 application = real_app
 return application


@pytest.fixture()
async def client():
    async with httpx.AsyncClient(base_url="http://backend:8080") as ac:
        yield ac

@pytest.fixture(scope="session", autouse=True)
async def recreate_test_db():
    await create_tables()
    yield

