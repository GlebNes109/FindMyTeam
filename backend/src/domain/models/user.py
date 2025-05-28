from typing import Optional
from uuid import UUID

from backend.src.domain.models.models import UpdateBaseModel, CreateBaseModel
from pydantic import BaseModel

from backend.src.legacy.db_models.api_models import NewUser


class UserCreate(CreateBaseModel):
    login: str
    password_hash: str
    email: str
    tg_nickname: str

class UserRead(BaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str
    password_hash: Optional[str] = None # в бизнес модели хеш допустим, эта модель не отдается в апи

class UserUpdate(UpdateBaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None

class TokenRead(BaseModel):
    token: str
    user_id: str