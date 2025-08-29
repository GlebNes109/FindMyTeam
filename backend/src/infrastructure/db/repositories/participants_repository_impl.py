import uuid

from sqlmodel import select
from typing import Any
from sqlalchemy.exc import IntegrityError

from domain.interfaces.repositories.participants_repository import ParticipantsRepository
from domain.models.participants import ParticipantsUpdate, ParticipantsCreate, ParticipantsBasicRead
from infrastructure.db.db_models.participants import ParticipantsDB
from infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl

from domain.exceptions import ObjectAlreadyExistsError


class ParticipantsRepositoryImpl(
    BaseRepositoryImpl[ParticipantsDB, ParticipantsBasicRead, ParticipantsCreate, ParticipantsUpdate],
    ParticipantsRepository):

    async def create(self, obj: ParticipantsCreate) -> ParticipantsBasicRead:
        db_obj = self.model(**obj.model_dump())
        db_obj.id = str(uuid.uuid4())
        # проверка что он уже есть
        print(obj.event_id)
        stmt = select(ParticipantsDB).where(ParticipantsDB.user_id == obj.user_id, ParticipantsDB.event_id == obj.event_id)
        result = await self.session.execute(stmt)
        objs = result.scalar_one_or_none()
        print(objs)
        if objs is not None:
            raise ObjectAlreadyExistsError

        try:
            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
            return self.read_schema.model_validate(db_obj, from_attributes=True)
        except IntegrityError as e:
            if e.orig.sqlstate == '23505':
                raise ObjectAlreadyExistsError from e
            else:
                raise

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