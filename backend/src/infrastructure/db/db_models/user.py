import uuid
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field

from domain.models.user import Role


class UsersDB(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    login: str = Field(unique=True)
    password_hash: Optional[str] = Field(default=None) # если OAuth , то хеш не нужен
    email: Optional[str] = Field(default=None)
    tg_nickname: Optional[str] = Field(default=None)
    role: Optional[Role] = Role.USER

class OauthAccountsDB(SQLModel, table=True):
    user_id: str = Field(primary_key=True)
    provider: str
    provider_id: str
