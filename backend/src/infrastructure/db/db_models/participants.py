from typing import List

from sqlmodel import SQLModel, Field, Relationship

from backend.src.domain.models.participants import EventRole
from backend.src.infrastructure.db.db_models.teams import TeamMembersDB


class ParticipantsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    event_id: str = Field(foreign_key="events.id")
    user_id: str = Field(foreign_key="users.id")
    track_id: str = Field(foreign_key="eventtracks.id")
    event_role: EventRole
    resume: str

    teams: List["TeamMembersDB"] = Relationship(back_populates="participant")