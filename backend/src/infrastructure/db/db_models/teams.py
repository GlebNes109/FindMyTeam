from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

from infrastructure.db.db_models.participants import ParticipantsDB


class TeamsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    event_id: str = Field(foreign_key="eventsdb.id")
    teamlead_id: str = Field(foreign_key="participantsdb.id")
    description: str

    vacancies: List["TeamVacanciesDB"] = Relationship(back_populates="team")
    members: List["TeamMembersDB"] = Relationship(back_populates="team")


class TeamMembersDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    team_id: str = Field(foreign_key="teamsdb.id")
    participant_id: str = Field(foreign_key="participantsdb.id")

    team: "TeamsDB" = Relationship(back_populates="members")
    participant: "ParticipantsDB" = Relationship(back_populates="teams")


class TeamVacanciesDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    team_id: str = Field(foreign_key="teamsdb.id")
    event_track_id: str = Field(foreign_key="eventtracksdb.id")
    description: str

    team: "TeamsDB" = Relationship(back_populates="vacancies")
    skills: List["TeamVacanciesSkillsDB"] = Relationship(back_populates="vacancy")


class TeamVacanciesSkillsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    skill: str
    vacancy_id: str = Field(foreign_key="teamvacanciesdb.id")

    vacancy: "TeamVacanciesDB" = Relationship(back_populates="skills")