from typing import List, Optional

from sqlmodel import SQLModel, Field, Relationship

class EventsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    description: str
    start_date: str
    end_date: str
    # Связь один ко многим
    event_tracks: List["EventTracksDB"] = Relationship(back_populates="event")

class EventTracksDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    event_id: str = Field(foreign_key="eventsdb.id")
    name: str
    event: Optional[EventsDB] = Relationship(back_populates="event_tracks")  # Обратная связь
