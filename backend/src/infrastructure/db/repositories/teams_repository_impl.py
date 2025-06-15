from sqlmodel import select

from backend.src.domain.interfaces.repositories.teams_repository import TeamsRepository
from backend.src.domain.models.models import CreateModelType, ReadModelType
from backend.src.domain.models.teams import TeamsRead, TeamsCreate, TeamsUpdate
from backend.src.infrastructure.db.db_models.teams import TeamsDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class TeamsRepositoryImpl(
    BaseRepositoryImpl[TeamsDB, TeamsRead, TeamsCreate, TeamsUpdate],
    TeamsRepository):

    async def get_all_by_event_id(self, event_id) -> list[TeamsRead]:
        stmt = select(self.model).where(TeamsRead.event_id == event_id)
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]