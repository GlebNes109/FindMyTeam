from sqlmodel import Field, SQLModel


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