from enum import Enum
from typing import Optional, Any

from pydantic import BaseModel, model_validator, validator, field_validator

from backend.src.domain.models.user import UserRead


class StrictBaseModel(BaseModel):
    @field_validator('*', mode='before')
    @classmethod
    def no_empty_strings(cls, v: Any):
        if isinstance(v, str) and not v.strip():
            raise ValueError()
        return v

class UserCreateApi(StrictBaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str

class AuthUserApi(StrictBaseModel):
    login: str
    password: str

class UserReadApi(StrictBaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str
    role: str
    @classmethod
    def from_user_read(cls, user_read: UserRead) -> "UserReadApi":
        return cls(
            id=user_read.id,
            login=user_read.login,
            email=user_read.email,
            tg_nickname=user_read.tg_nickname,
            role=user_read.role
        )

class UserUpdateApi(StrictBaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None
