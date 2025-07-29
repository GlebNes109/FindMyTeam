from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field

from domain.models.user import Role


class UsersDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    login: str = Field(unique=True)
    password_hash: str
    email: str
    tg_nickname: str
    role: Optional[Role] = Role.USER