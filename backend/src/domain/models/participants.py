from enum import Enum
from typing import Optional, Any
from pydantic import model_validator

from backend.src.domain.exceptions import BadRequestError
from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.models import CreateBaseModel, UpdateBaseModel
from backend.src.domain.models.teams import TeamsCreate
from pydantic import BaseModel


class EventRole(str, Enum):
    TEAMLEAD = "TEAMLEAD"
    PARTICIPANT = "PARTICIPANT"


class ParticipantsCreate(CreateBaseModel):
    event_id: str
    track_id: str
    event_role: EventRole
    resume: str
    user_id: str
    team: Optional[TeamsCreate] = None
    @model_validator(mode="after")
    def validate(self):
        if self.event_role == EventRole.TEAMLEAD and self.team == None:
            raise ValueError
        if self.event_role == EventRole.PARTICIPANT and self.team:
            raise ValueError
        return self
    @classmethod
    def map_to_domain_model(cls, user_id: str, data: Any) -> "ParticipantsCreate":
        return cls(user_id=user_id, **data)


class ParticipantsUpdate(UpdateBaseModel):
    event_id: Optional[str]
    track_id: Optional[str]
    event_role: Optional[EventRole]
    resume: Optional[str]
    team: Optional[TeamsCreate] = None
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
    track: EventTracksRead
    event_role: EventRole
    resume: str

class ParticipantsDomainModel(BaseModel):
    id: str
    event_id: str
    track_id: str
    event_role: str
    resume: str