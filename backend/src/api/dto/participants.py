from typing import Optional

from api.dto.strictbasemodel import StrictBaseModel
from domain.models.participants import EventRole

class VacanciesCreateAPI(StrictBaseModel):
    event_track_id: str
    description: str

class TeamsCreateAPI(StrictBaseModel):
    # members_login: Optional[list[str]] = None #логины участников команды
    name: str
    description: str
    # event_id: Optional[str] = None
    vacancies: Optional[list[VacanciesCreateAPI]] = None

class ParticipantsCreateAPI(StrictBaseModel):
    event_id: str
    track_id: str
    event_role: EventRole
    resume: str
    team: Optional[TeamsCreateAPI] = None