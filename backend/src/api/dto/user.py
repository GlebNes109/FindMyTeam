from enum import Enum
from typing import Optional, Any

from pydantic import BaseModel, model_validator, validator, field_validator

from api.dto.strictbasemodel import StrictBaseModel
from domain.models.user import UsersRead


class UserCreateAPI(StrictBaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str

class AuthUserAPI(StrictBaseModel):
    login: str
    password: str

class UserReadAPI(StrictBaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str
    role: str
    @classmethod
    def from_user_read(cls, user_read: UsersRead) -> "UserReadAPI":
        return cls(
            id=user_read.id,
            login=user_read.login,
            email=user_read.email,
            tg_nickname=user_read.tg_nickname,
            role=user_read.role
        )

class UserUpdateAPI(StrictBaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None

class TokenRead(BaseModel):
    access_token: str
    user_id: str
