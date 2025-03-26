from sqlmodel import SQLModel, Field

class UserDB(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: str = Field(primary_key=True)
    login: str = Field(unique=True)
    password_hash: str
    email: str
    tg_nickname: str = Field(unique=True)
    role: str