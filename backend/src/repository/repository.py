import uuid

from sqlmodel import SQLModel, Session
from sqlalchemy import create_engine

from backend.src.config import settings
from backend.src.models.db_models import UserDB

DATABASE_URL = f"postgresql://{settings.postgres_username}:{settings.postgres_password}@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_database}"
engine = create_engine(DATABASE_URL)


class Repository:
    def __init__(self):
        SQLModel.metadata.create_all(engine)

    def add_user(self, new_user):
        with Session(engine) as session:
            user_db = UserDB(**new_user)
            user_db.id = str(uuid.uuid4())
            session.add(user_db)
            session.commit()