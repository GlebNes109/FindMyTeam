from typing import Optional

from backend.src.api.dto.strictbasemodel import StrictBaseModel
from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.participants import EventRole
from pydantic import model_validator

class VacanciesCreateAPI(StrictBaseModel):
    event_track_id: str
    description: str

class TeamsCreateAPI(StrictBaseModel):
    # members_login: Optional[list[str]] = None #логины участников команды
    name: str
    description: str
    vacancies: Optional[list[VacanciesCreateAPI]] = None

class ParticipantsCreateAPI(StrictBaseModel):
    event_id: str
    track_id: str
    event_role: EventRole
    resume: str
    team: Optional[TeamsCreateAPI] = None
    @model_validator(mode="after")
    def validate(self):
        if self.event_role == EventRole.TEAMLEAD and self.team == None:
            raise ValueError
        if self.event_role == EventRole.PARTICIPANT and self.team:
            raise ValueError
        return self