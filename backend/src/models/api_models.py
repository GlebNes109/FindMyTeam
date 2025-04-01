from enum import Enum
from typing import Optional

from pydantic import BaseModel

class Role(str, Enum):
    USER = "USER"
    TEAM_CAPTAIN = "TEAM_CAPTAIN"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class NewUser(BaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str
    role: Role

class SigninUser(BaseModel):
    login: str
    password: str

class UserData(BaseModel):
    login: str
    email: str
    tg_nickname: str
    role: Role

class PatchUser(BaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None
    role: Optional[Role] = None

class NewTeam(BaseModel):
    # captain_id: str
    # members_login: Optional[list[str]] = None# логины участников команды
    team_name: str
    team_description: str
    event_name: str # имя мероприятия

class NewEvent(BaseModel):
    event_name: str
    event_description: str