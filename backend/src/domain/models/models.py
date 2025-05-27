import uuid
from enum import Enum
from typing import Optional, Any, TypeVar

from pydantic import BaseModel, model_validator, validator, field_validator


class StrictBaseModel(BaseModel):
    @field_validator('*', mode='before')
    @classmethod
    def no_empty_strings(cls, v: Any, info):
        if isinstance(v, str) and not v.strip():
            raise ValueError()
        return v

class CreateBaseModel(BaseModel):
    # контракт для создания моделей
    id: uuid.UUID | None = None


class UpdateBaseModel(BaseModel):
    # Контракт обновления моделей.
    id: uuid.UUID

ModelType = TypeVar("ModelType")
UpdateModelType = TypeVar("UpdateModelType", bound=UpdateBaseModel)
CreateModelType = TypeVar("CreateModelType", bound=CreateBaseModel)
ReadModelType = TypeVar("ReadModelType", bound=BaseModel)