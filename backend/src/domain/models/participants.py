from enum import Enum
from typing import Optional, Any, ForwardRef
from pydantic import model_validator

from domain.exceptions import BadRequestError
from domain.models.events import EventTracksRead
from domain.models.models import CreateBaseModel, UpdateBaseModel
from pydantic import BaseModel

from domain.models.user import Role, UsersRead


# TeamsCreate = ForwardRef('TeamsCreate')

class EventRole(str, Enum):
    TEAMLEAD = "TEAMLEAD"
    PARTICIPANT = "PARTICIPANT"


class ParticipantsCreate(CreateBaseModel):
    event_id: str
    track_id: str
    event_role: EventRole
    resume: str
    user_id: str
    team: Optional[BaseModel] = None
    @model_validator(mode="after")
    def validate(self):
        if self.event_role == EventRole.TEAMLEAD and self.team == None:
            raise ValueError
        if self.event_role == EventRole.PARTICIPANT and self.team:
            raise ValueError
        return self


class ParticipantsUpdate(UpdateBaseModel):
    event_id: Optional[str]
    track_id: Optional[str]
    event_role: Optional[EventRole]
    resume: Optional[str]
    team: Optional[BaseModel] = None # все валидируется в апи
    @model_validator(mode="after")
    def validate(self):
        if self.event_role == EventRole.TEAMLEAD and self.team == None:
            raise BadRequestError
        if self.event_role == EventRole.PARTICIPANT and self.team:
            raise BadRequestError
        return self

class ParticipantsRead(BaseModel):
    id: str
    event_id: str
    user_id: str
    track: EventTracksRead
    event_role: EventRole
    resume: str

    @classmethod
    def from_domain(cls, participant: "ParticipantsBasicRead", track: EventTracksRead) -> "ParticipantsRead":
        return cls(
            id=participant.id,
            event_id=participant.event_id,
            track=track,
            event_role=participant.event_role,
            resume=participant.resume,
            user_id=participant.user_id,
        )

    def check_user_id(cls, user_id) -> bool:
        return cls.user_id == user_id

    def is_teamlead(cls):
        return cls.event_role == EventRole.TEAMLEAD

class ParticipantsBasicRead(BaseModel):
    id: str
    event_id: str
    track_id: str
    user_id: str
    event_role: EventRole
    resume: str

class ParticipantsDetailsRead(ParticipantsRead):
    login: str
    email: str
    tg_nickname: str
    role: Role
