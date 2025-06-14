from typing import Optional

from backend.src.domain.models.models import CreateBaseModel

# в отдельный сервис?
class VacanciesCreate(CreateBaseModel):
    event_track_id: str
    description: str


class TeamsCreate(CreateBaseModel):
    # members_login: Optional[list[str]] = None #логины участников команды
    name: str
    description: str
    vacancies: Optional[list[VacanciesCreate]] = None
