from enum import Enum
from typing import Optional, Any

from pydantic import BaseModel, model_validator, validator, field_validator


class StrictBaseModel(BaseModel):
    @field_validator('*', mode='before')
    @classmethod
    def no_empty_strings(cls, v: Any, info):
        if isinstance(v, str) and not v.strip():
            raise ValueError()
        return v

class EventRole(str, Enum):
    TEAMLEAD = "TEAMLEAD"
    PARTICIPANT = "PARTICIPANT"

class NewUser(StrictBaseModel):
    login: str
    password: str
    email: str
    tg_nickname: str

class SigninUser(StrictBaseModel):
    login: str
    password: str

class UserData(StrictBaseModel):
    id: str
    login: str
    email: str
    tg_nickname: str

class PatchUser(StrictBaseModel):
    login: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    tg_nickname: Optional[str] = None

class NewVacancy(StrictBaseModel):
    event_track_id: str
    description: str

class NewTeam(StrictBaseModel):
    # members_login: Optional[list[str]] = None #логины участников команды
    name: str
    description: str
    vacancies: Optional[list[NewVacancy]] = None

class EventTrackData(StrictBaseModel):
    id: str
    name: str

class NewEventTrack(StrictBaseModel):
    name: str

class NewEvent(StrictBaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[NewEventTrack]

class NewEventParticipant(StrictBaseModel):
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

class UserEventsData(StrictBaseModel):
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

class ParticipationData(StrictBaseModel):
    participant_id: str
    login: str
    track: EventTrackData
    event_role: str
    resume: str

class VacancyData(StrictBaseModel):
    id: str
    track: EventTrackData
    description: str

class TeamData(StrictBaseModel):
    id: str
    name: str
    description: str
    members: Optional[list[ParticipationData]] = None
    vacancies: Optional[list[VacancyData]] = None

class EventData(StrictBaseModel):
    id: str
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTrackData]
    event_teams: Optional[list[TeamData]] = None
    event_participants: Optional[list[ParticipationData]] = None

class NewInvitation(StrictBaseModel):
    vacancy_id: str
    participant_id: str