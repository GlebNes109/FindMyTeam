from typing import Optional
from pydantic import BaseModel
from backend.src.domain.models.models import CreateBaseModel, UpdateBaseModel

class EventTracksCreate(CreateBaseModel):
    name: str

class EventTracksRead(BaseModel):
    id: str
    event_id: str
    name: str

class EventsCreate(CreateBaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTracksCreate]

class EventsUpdate(UpdateBaseModel):
    id: str
    name: Optional[str]
    description: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    event_tracks: Optional[list[EventTracksCreate]]

class EventsRead(BaseModel):
    id: str
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTracksRead]
