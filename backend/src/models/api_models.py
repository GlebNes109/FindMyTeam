from enum import Enum
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