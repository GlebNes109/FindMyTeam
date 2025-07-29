import uuid
from enum import Enum
from typing import Optional, Any, TypeVar

from pydantic import BaseModel, model_validator, validator, field_validator

class CreateBaseModel(BaseModel):
    # контракт для создания моделей
    id: str | None = None


class UpdateBaseModel(BaseModel):
    # Контракт обновления моделей.
    id: str

ModelType = TypeVar("ModelType")
UpdateModelType = TypeVar("UpdateModelType", bound=UpdateBaseModel)
CreateModelType = TypeVar("CreateModelType", bound=CreateBaseModel)
ReadModelType = TypeVar("ReadModelType", bound=BaseModel)