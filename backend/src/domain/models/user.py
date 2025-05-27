from typing import Optional
from backend.src.domain.models.models import StrictBaseModel, UpdateBaseModel, CreateBaseModel
from pydantic import BaseModel

class UserCreate(CreateBaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str

class UserRead(BaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str

class UserUpdate(UpdateBaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None