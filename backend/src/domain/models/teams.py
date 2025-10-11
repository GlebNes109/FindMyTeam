from typing import Optional, ForwardRef, Any

from domain.models.events import EventTracksRead
from domain.models.models import CreateBaseModel, UpdateBaseModel
from pydantic import BaseModel

from domain.models.participants import ParticipantsDetailsRead


class VacanciesCreate(CreateBaseModel):
    event_track_id: str
    description: str

class VacanciesRead(BaseModel):
    id: str
    track: EventTracksRead
    description: str
    team_id: str

class VacanciesDetailsRead(BaseModel):
    id: str
    track: EventTracksRead
    description: str
    team_id: str
    team_name: str

class VacanciesBasicRead(BaseModel):
    id: str
    track_id: str
    description: str
    team_id: str

class TeamsCreate(CreateBaseModel):
    name: str
    description: str
    teamlead_id: Optional[str] = None
    event_id: Optional[str] = None
    vacancies: Optional[list[VacanciesCreate]] = None
    @classmethod
    def map_to_domain_model(cls, event_id: str, teamlead_id: str, data: Any) -> "TeamsCreate":
        return cls(event_id=event_id, teamlead_id=teamlead_id, **data.model_dump(mode="json", by_alias=True))

class TeamsUpdate(UpdateBaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    # vacancies: Optional[list[VacanciesCreate]] = None
    # members_ids: Optional[list[str]]

class TeamsRead(BaseModel):
    id: str
    name: str
    event_id: str
    teamlead_id: str
    description: str
    vacancies: Optional[list[VacanciesRead]] = None
    members_ids: list[str]

class TeamsDetailsRead(BaseModel):
    id: str
    name: str
    event_id: str
    teamlead_id: str
    description: str
    vacancies: Optional[list[VacanciesRead]] = None
    members: list[ParticipantsDetailsRead]

class TeamsBasicRead(BaseModel):
    id: str
    name: str
    event_id: str
    teamlead_id: str
    description: str

class TeamMembersRead(BaseModel):
    id: str
    team_id: str
    participant_id: str

class TeamMembersCreate(CreateBaseModel):
    team_id: str
    participant_id: str

class TeamMembersUpdate(UpdateBaseModel):
    team_id: str
    participant_id: str

class VacanciesWithPagination(BaseModel):
    items: list[VacanciesDetailsRead]
    total: int
    page: int
    per_page: int
    total_pages: int