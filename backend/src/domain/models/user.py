from enum import Enum
from typing import Optional

from core.config import settings
from domain.models.models import UpdateBaseModel, CreateBaseModel
from pydantic import BaseModel, EmailStr

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class UsersCreate(CreateBaseModel): # при создании без стороннего oauth провайдера все поля обязательны
    login: str
    password_hash: str
    email: str
    tg_nickname: str

"""class UsersOauthCreate(CreateBaseModel):
    login: str
    email: Optional[EmailStr] = None
    tg_nickname: Optional[str] = None
    provider: str
    provider_id: str"""

class UsersRead(BaseModel):
    id: str
    login: str
    email: Optional[str] = None
    tg_nickname: Optional[str] = None
    password_hash: Optional[str] = None # в бизнес модели хеш допустим, эта модель не отдается в апи
    role: Role
    @classmethod
    def is_admin(self):
        return self.role in settings.admins

class UsersUpdate(UpdateBaseModel):
    id: str
    login: Optional[str] = None
    # password: Optional[str] = None
    password_hash: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str


class OAuthAccountRead(BaseModel):
    id: str
    provider: str               # "google", "github", "telegram"
    provider_id: str            # внешний id от провайдера
    user_id: str                # ссылка на пользователя

class OAuthAccountCreate(CreateBaseModel):
    login: str
    email: Optional[EmailStr] = None
    tg_nickname: Optional[str] = None
    provider: str
    provider_id: str