from sqlmodel import select
from typing import Any

from backend.src.domain.interfaces.repositories.participants_repository import ParticipantsRepository
from backend.src.domain.models.participants import ParticipantsUpdate, ParticipantsCreate, ParticipantsDomainModel
from backend.src.infrastructure.db.db_models.participants import ParticipantsDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class ParticipantsRepositoryImpl(
    BaseRepositoryImpl[ParticipantsDB, ParticipantsDomainModel, ParticipantsCreate, ParticipantsUpdate],
    ParticipantsRepository):

    async def get_all_for_user(self, user_id: str, limit: int, offset: int) -> list[ParticipantsDomainModel]:
        stmt = select(ParticipantsDB).where(ParticipantsDB.user_id == user_id).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]

    # async def create_participant(self, obj: ParticipantsCreate, user_id) -> ParticipantsRead: