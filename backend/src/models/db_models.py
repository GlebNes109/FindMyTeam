from enum import Enum
from typing import Optional, List

from sqlmodel import SQLModel, Field

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class EventRole(str, Enum):
    TEAMLEAD = "TEAMLEAD"
    PARTICIPANT = "PARTICIPANT"

class UsersDB(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: str = Field(primary_key=True)
    login: str = Field(unique=True)
    password_hash: str
    email: str
    tg_nickname: str
    role: Optional[Role] = Role.USER

class EventParticipantsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    event_id: str # = Field(foreign_key="events.id")
    user_id: str # = Field(foreign_key="users.id")
    track_id: str # = Field(foreign_key="eventtracks.id")
    event_role: EventRole
    resume: str

class ParticipantSkillsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    skill: str
    participant_id: str

class EventsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    description: str
    start_date: str
    end_date: str

class EventTracksDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    event_id: str # = Field(foreign_key="events.id")
    name: str

'''class UserRolesDB(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str'''

class TeamsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    event_id: str # = Field(foreign_key="events.id")
    teamlead_id: str # = Field(foreign_key="eventparticipations.id")
    description: str

class TeamMembersDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    team_id: str # = Field(foreign_key="teams.id", primary_key=True)
    participant_id: str # = Field(foreign_key="eventparticipations.id", primary_key=True)

class TeamVacanciesDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    team_id: str # = Field(foreign_key="teams.id")
    event_track_id: str # = Field(foreign_key="eventtracks.id")
    description: str

class TeamVacanciesSkillsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    skill: str
    vacancy_id: str

class TeamInvitationsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    vacancy_id: str # = Field(foreign_key="teamvacancies.id")
    participant_id: str # = Field(foreign_key="eventparticipations.id")
    approved_by_teamlead: bool
    approved_by_participant: bool
