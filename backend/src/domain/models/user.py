from enum import Enum
from typing import Optional
from backend.src.domain.models.models import UpdateBaseModel, CreateBaseModel
from pydantic import BaseModel

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class UsersCreate(CreateBaseModel):
    login: str
    password_hash: str
    email: str
    tg_nickname: str

class UsersRead(BaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str
    password_hash: Optional[str] = None # в бизнес модели хеш допустим, эта модель не отдается в апи
    role: Role

class UsersUpdate(UpdateBaseModel):
    id: str
    login: Optional[str] = None
    # password: Optional[str] = None
    password_hash: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None

class TokenRead(BaseModel):
    token: str
    user_id: str