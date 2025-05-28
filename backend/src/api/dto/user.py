from enum import Enum
from typing import Optional, Any

from pydantic import BaseModel, model_validator, validator, field_validator

class StrictBaseModel(BaseModel):
    @field_validator('*', mode='before')
    @classmethod
    def no_empty_strings(cls, v: Any):
        if isinstance(v, str) and not v.strip():
            raise ValueError()
        return v

class UserCreate(StrictBaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str

class AuthUser(StrictBaseModel):
    login: str
    password: str

class UserRead(StrictBaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str

class UserUpdate(StrictBaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None
