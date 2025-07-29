from sqlmodel import select
from typing import Any

from domain.interfaces.repositories.participants_repository import ParticipantsRepository
from domain.models.participants import ParticipantsUpdate, ParticipantsCreate, ParticipantsBasicRead
from infrastructure.db.db_models.participants import ParticipantsDB
from infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class ParticipantsRepositoryImpl(
    BaseRepositoryImpl[ParticipantsDB, ParticipantsBasicRead, ParticipantsCreate, ParticipantsUpdate],
    ParticipantsRepository):

    async def get_all_for_user(self, user_id: str, limit: int, offset: int) -> list[ParticipantsBasicRead]:
        stmt = select(ParticipantsDB).where(ParticipantsDB.user_id == user_id).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]

    async def get_all_for_event(self, event_id: Any, limit: int, offset: int) -> list[ParticipantsBasicRead]:
        stmt = select(ParticipantsDB).where(ParticipantsDB.event_id == event_id).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]
    # async def create_participant(self, obj: ParticipantsCreate, user_id) -> ParticipantsRead:

    async def get_all_by_ids(self, ids: list[str]) -> list[ParticipantsBasicRead]:
        stmt = select(ParticipantsDB).where(ParticipantsDB.id.in_(ids))
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]