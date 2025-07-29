import uuid
from sqlalchemy.exc import IntegrityError, NoResultFound
from typing import Generic, Type, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from domain.exceptions import ObjectNotFoundError
from domain.models.models import CreateModelType, ReadModelType, ModelType, UpdateModelType
from domain.interfaces.repositories.base_repository import BaseRepository
from domain.exceptions import ObjectAlreadyExistsError


class BaseRepositoryImpl(
    BaseRepository[ModelType, ReadModelType, CreateModelType, UpdateModelType],
    Generic[ModelType, ReadModelType, CreateModelType, UpdateModelType]):
    def __init__(self, session: AsyncSession, model: Type[ModelType], read_schema: Type[ReadModelType]):
        self.session = session
        self.model = model
        self.read_schema = read_schema

    async def get(self, id: Any) -> ReadModelType:
        stmt = select(self.model).where(self.model.id == id)
        result = await self.session.execute(stmt)
        try:
            obj = result.scalar_one()
            return self.read_schema.model_validate(obj, from_attributes=True)
        except NoResultFound:
            raise ObjectNotFoundError

    async def get_all(self, limit: int, offset: int) -> list[ReadModelType]:
        stmt = select(self.model).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]

    async def create(self, obj: CreateModelType) -> ReadModelType:
        db_obj = self.model(**obj.model_dump())
        db_obj.id = str(uuid.uuid4())
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

    async def update(self, obj: UpdateModelType) -> ReadModelType:
        await self.session.execute(
            update(self.model)
            .where(self.model.id == obj.id)
            .values(**obj.model_dump())
        )
        await self.session.commit()
        return await self.get(obj.id)

    async def delete(self, id: Any) -> bool:
        await self.get(id) # проверка что существует (чтобы не удаляли по нескольку раз одно и то же)))
        await self.session.execute(delete(self.model).where(self.model.id == id))
        await self.session.commit()
        return True
