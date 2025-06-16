from typing import Optional, ForwardRef, Any

from backend.src.domain.models.events import EventTracksRead
from backend.src.domain.models.models import CreateBaseModel, UpdateBaseModel
from pydantic import BaseModel

from backend.src.domain.models.participants import ParticipantsRead

# в отдельный сервис?
class VacanciesCreate(CreateBaseModel):
    event_track_id: str
    description: str

class VacanciesRead(BaseModel):
    id: str
    track: EventTracksRead
    description: str

class TeamsCreate(CreateBaseModel):
    name: str
    description: str
    teamlead_id: Optional[str] = None
    event_id: Optional[str] = None
    vacancies: Optional[list[VacanciesCreate]] = None
    @classmethod
    def map_to_domain_model(cls, event_id: str, teamlead_id: str, data: Any) -> "TeamsCreate":
        return cls(event_id=event_id, teamlead_id=teamlead_id, **data.model_dump())

class TeamsUpdate(UpdateBaseModel):
    name: Optional[str]
    description: Optional[str]
    vacancies: Optional[list[VacanciesCreate]] = None

class TeamsRead(BaseModel):
    id: str
    name: str
    description: str
    vacancies: Optional[list[VacanciesRead]] = None
    members: list[ParticipantsRead]

"""class TeamsDomainValidate(BaseModel):
    name: str
    description: str
    # event_id: Optional[str] = None
    vacancies: Optional[list[VacanciesCreate]] = None"""