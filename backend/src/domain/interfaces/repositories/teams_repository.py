from typing import Any, Protocol

from backend.src.domain.interfaces.repositories.base_repository import BaseRepository
from backend.src.domain.models.models import CreateModelType, ReadModelType
from backend.src.domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate, VacanciesRead, TeamsBasicRead, \
    VacanciesBasicRead, TeamMembersCreate, TeamMembersRead


class TeamsRepository(BaseRepository[Any, TeamsBasicRead, TeamsCreate, TeamsUpdate], Protocol):
    async def get_all_by_event_id(self, event_id: Any): ...

    async def get_vacancy(self, vacancy_id: Any) -> VacanciesRead: ...
    async def get_vacancy(self, vacancy_id: Any) -> VacanciesBasicRead: ...