from typing import Any, Protocol

from domain.interfaces.repositories.base_repository import BaseRepository
from domain.models.models import CreateModelType, ReadModelType
from domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate, VacanciesRead, TeamsBasicRead, \
    VacanciesBasicRead, TeamMembersCreate, TeamMembersRead


class TeamsRepository(BaseRepository[Any, TeamsBasicRead, TeamsCreate, TeamsUpdate], Protocol):
    async def get_all_by_event_id(self, event_id: Any): ...

    async def get_vacancy(self, vacancy_id: Any) -> VacanciesBasicRead: ...

    async def create_member(self, obj: TeamMembersCreate) -> TeamMembersRead: ...

    async def get_by_teamlead_id(self, teamlead_id: Any) -> TeamsRead: ...

    async def get_read_model(self, id: Any) -> TeamsRead: ...

    async def delete_vacancy(self, id: Any) -> bool: ...