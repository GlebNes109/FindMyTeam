from typing import Optional

from pydantic import BaseModel, model_validator

from backend.src.domain.exceptions import BadRequestError
from backend.src.domain.models.models import CreateBaseModel, UpdateBaseModel
from backend.src.domain.models.participants import ParticipantsDetailsRead
from backend.src.domain.models.teams import VacanciesRead, TeamsRead


class TeamRequestsCreate(CreateBaseModel):
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: Optional[bool] = None
    approved_by_participant: Optional[bool] = None

class TeamRequestsPartialCreate(CreateBaseModel): # первичная модель, то что должно приходить из апи
    vacancy_id: str
    participant_id: str

class TeamRequestsRead(BaseModel):
    id: str
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: Optional[bool] = None
    approved_by_participant: Optional[bool] = None # None значит ее еще не рассмотрели

class TeamRequestsDetailsRead(BaseModel):
    id: str
    vacancy: VacanciesRead
    team: Optional[TeamsRead] = None
    participant: Optional[ParticipantsDetailsRead] = None
    approved_by_teamlead: Optional[bool] = None
    approved_by_participant: Optional[bool] = None
    @model_validator(mode="after")
    def validate(self):
        if self.participant and self.team:
            raise BadRequestError
        if self.participant is None and self.team is None:
            raise BadRequestError
        return self # либо participant либо team, но не оба сразу

class TeamRequestsUpdate(UpdateBaseModel):
    id: str
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: bool
    approved_by_participant: bool
