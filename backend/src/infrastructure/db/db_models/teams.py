import uuid

from sqlmodel import SQLModel, Field, Relationship, Column, ForeignKey
from typing import List, Optional

from infrastructure.db.db_models.participants import ParticipantsDB


class TeamsDB(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    event_id: str = Field(foreign_key="eventsdb.id")
    teamlead_id: str = Field(
        sa_column=Column(ForeignKey("participantsdb.id", ondelete="CASCADE"))
    )
    description: str

    vacancies: List["TeamVacanciesDB"] = Relationship(back_populates="team")
    members: List["TeamMembersDB"] = Relationship(back_populates="team")


class TeamMembersDB(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    team_id: str = Field(
        sa_column=Column(ForeignKey("teamsdb.id", ondelete="CASCADE"))
    )
    participant_id: str = Field(
        sa_column=Column(ForeignKey("participantsdb.id", ondelete="CASCADE"))
    )

    team: "TeamsDB" = Relationship(back_populates="members")
    participant: "ParticipantsDB" = Relationship(back_populates="teams")


class TeamVacanciesDB(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    team_id: str = Field(
        sa_column=Column(ForeignKey("teamsdb.id", ondelete="CASCADE"))
    )
    event_track_id: str = Field(foreign_key="eventtracksdb.id")
    description: str

    team: "TeamsDB" = Relationship(back_populates="vacancies")
    skills: List["TeamVacanciesSkillsDB"] = Relationship(back_populates="vacancy")


class TeamVacanciesSkillsDB(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    skill: str
    vacancy_id: str = Field(
        sa_column=Column(ForeignKey("teamvacanciesdb.id", ondelete="CASCADE"))
    )

    vacancy: "TeamVacanciesDB" = Relationship(back_populates="skills")