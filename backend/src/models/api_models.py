from enum import Enum
from typing import Optional

from pydantic import BaseModel

class NewUser(BaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str

class SigninUser(BaseModel):
    login: str
    password: str

class UserData(BaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str

class PatchUser(BaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None

class NewTeam(BaseModel):
    # members_login: Optional[list[str]] = None# логины участников команды
    name: str
    event_id: str
    description: str

class EventTrack(BaseModel):
    name: str

class NewEvent(BaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTrack]

class EventData(BaseModel):
    id: str
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTrack]

class AllEventsData(BaseModel):
    events: list[EventData]

