from enum import Enum
from typing import Optional, Any
import re

from pydantic import BaseModel, model_validator, validator, field_validator, EmailStr

from api.dto.strictbasemodel import StrictBaseModel
from domain.models.user import UsersRead

from domain.exceptions import BadRequestError


class UserCreateAPI(StrictBaseModel):
    login: str
    password: str
    email: EmailStr
    tg_nickname: str

    @field_validator("login")
    def validate_login(cls, v):
        if not (4 <= len(v) <= 30):
            raise ValueError("Логин должен содержать от 4 до 30 символов")
        return v

    @field_validator("password")
    def validate_password(cls, v):
        # минимум 8 символов, хотя бы одна цифра, одна заглавная буква и спецсимвол
        if len(v) < 8:
            # raise ValueError("Пароль должен быть не короче 8 символов")
            raise BadRequestError
        if not re.search(r"[A-Z]", v):
            # raise ValueError("Пароль должен содержать хотя бы одну заглавную букву")
            raise BadRequestError
        if not re.search(r"[a-z]", v):
            # raise ValueError("Пароль должен содержать хотя бы одну строчную букву")
            raise BadRequestError
        if not re.search(r"\d", v):
            # raise ValueError("Пароль должен содержать хотя бы одну цифру")
            raise BadRequestError
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            # raise ValueError("Пароль должен содержать хотя бы один спецсимвол")
            raise BadRequestError
        return v

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
