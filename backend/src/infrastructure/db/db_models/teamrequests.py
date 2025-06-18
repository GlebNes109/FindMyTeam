from sqlmodel import Field, SQLModel


class TeamRequestsDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    vacancy_id: str
    participant_id: str
    approved_by_teamlead: bool
    approved_by_participant: bool