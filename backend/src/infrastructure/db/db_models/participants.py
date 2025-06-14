from sqlmodel import Field, SQLModel

from backend.src.domain.models.participants import EventRole


class ParticipantsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    event_id: str # = Field(foreign_key="events.id")
    user_id: str # = Field(foreign_key="users.id")
    track_id: str # = Field(foreign_key="eventtracks.id")
    event_role: EventRole
    resume: str