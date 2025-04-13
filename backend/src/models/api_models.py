from enum import Enum
from typing import Optional

from pydantic import BaseModel, model_validator


class EventRole(str, Enum):
    TEAMLEAD = "TEAMLEAD"
    PARTICIPANT = "PARTICIPANT"

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
    description: str

class EventTrackData(BaseModel):
    id: str
    name: str

class NewEventTrack(BaseModel):
    name: str

class NewEvent(BaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[NewEventTrack]

class NewEventParticipant(BaseModel):
    event_id: str
    track_id: str
    event_role: EventRole
    resume: str
    team: Optional[NewTeam] = None
    @model_validator(mode="after")
    def validate(self):
        if self.event_role == EventRole.TEAMLEAD and self.team == None:
            raise ValueError
        if self.event_role == EventRole.PARTICIPANT and self.team:
            raise ValueError
        return self
# если капитан - команда обязательна

class UserEventsData(BaseModel):
    id: str
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTrackData]
    participant_id: str
    event_role: EventRole
    resume: str
    # skills: Optional[list[str]]
    participant_track: str

class ParticipationData(BaseModel):
    participant_id: str
    login: str
    event_id: str
    track: EventTrackData
    event_role: str
    resume: str

class VacancyData(BaseModel):
    id: str
    event_track: EventTrackData
    description: str

class TeamData(BaseModel):
    id: str
    name: str
    description: str
    members: Optional[list[ParticipationData]] = None
    vacancies: Optional[list[VacancyData]] = None

class EventData(BaseModel):
    id: str
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTrackData]
    event_teams: Optional[list[TeamData]] = None