from typing import List, Optional

from sqlmodel import SQLModel, Field, Relationship

from domain.models.participants import EventRole

from infrastructure.db.db_models.events import EventsDB


class ParticipantsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    event_id: str = Field(foreign_key="eventsdb.id")
    user_id: str = Field(foreign_key="usersdb.id")
    track_id: str = Field(foreign_key="eventtracksdb.id")
    event_role: EventRole
    resume: str

    event: Optional[EventsDB] = Relationship(back_populates="participants")
    track: Optional["EventTracksDB"] = Relationship(back_populates="participants")
    teams: List["TeamMembersDB"] = Relationship(back_populates="participant")