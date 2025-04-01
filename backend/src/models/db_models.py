from typing import Optional

from sqlmodel import SQLModel, Field

class UserDB(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: str = Field(primary_key=True)
    login: str = Field(unique=True)
    password_hash: str
    email: str
    tg_nickname: str = Field(unique=True)
    role: str

class TeamDB(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: str = Field(primary_key=True)
    captain_id: str
    # members_login: Optional[list[str]] = None# логины участников команды
    team_name: str = Field(unique=True)
    team_description: str
    event_id: str # айди мероприятия

class EventDB(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: str = Field(primary_key=True)
    event_name: str = Field(unique=True)
    event_description: str