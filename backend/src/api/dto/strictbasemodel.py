from typing import Any

from pydantic import BaseModel, model_validator, validator, field_validator


class StrictBaseModel(BaseModel):
    @field_validator('*', mode='before')
    @classmethod
    def no_empty_strings(cls, v: Any):
        if isinstance(v, str) and not v.strip():
            raise ValueError()
        return v