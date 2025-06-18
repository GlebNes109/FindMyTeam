from pydantic import BaseModel

from backend.src.domain.models.models import CreateBaseModel, UpdateBaseModel

class TeamRequestsCreate(CreateBaseModel):
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: bool
    approved_by_participant: bool

class TeamRequestsPartialCreate(CreateBaseModel): # первичная модель, то что должно приходить из апи
    vacancy_id: str
    participant_id: str

class TeamRequestsRead(BaseModel):
    id: str
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: bool
    approved_by_participant: bool

class TeamRequestsUpdate(UpdateBaseModel):
    id: str
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: bool
    approved_by_participant: bool
