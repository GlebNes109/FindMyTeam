from enum import Enum
from typing import Optional, Any, ForwardRef
from pydantic import model_validator

from backend.src.domain.exceptions import BadRequestError
from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.models import CreateBaseModel, UpdateBaseModel
from pydantic import BaseModel



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
    @classmethod
    def map_to_domain_read_model(cls, user_id: str, data: BaseModel) -> "ParticipantsCreate":
        return cls(user_id=user_id, **data.model_dump())


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
    track: EventTracksRead
    event_role: EventRole
    resume: str

    @classmethod
    def from_domain(cls, participant: "ParticipantsDomainModel", track: EventTracksRead) -> "ParticipantsRead":
        return cls(
            id=participant.id,
            event_id=participant.event_id,
            track=track,
            event_role=participant.event_role,
            resume=participant.resume
        )

class ParticipantsDomainModel(BaseModel):
    id: str
    event_id: str
    track_id: str
    event_role: EventRole
    resume: str