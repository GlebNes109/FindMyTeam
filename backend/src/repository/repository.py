import uuid

from sqlalchemy.exc import IntegrityError
from sqlmodel import SQLModel, Session, select
from sqlalchemy import create_engine

from backend.src.config import settings
from backend.src.models.api_models import NewUser
from backend.src.models.db_models import UserDB
from backend.src.services.utility_services import create_hash

DATABASE_URL = f"postgresql://{settings.postgres_username}:{settings.postgres_password}@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_database}"
engine = create_engine(DATABASE_URL)


class Repository:
    def __init__(self):
        try:
            SQLModel.metadata.create_all(engine)
        except Exception as e:
            print(e)
            print('ОШИБКА БД - НЕ ПОДКЛЮЧЕНА')

    def add_user(self, new_user: NewUser):
        with Session(engine) as session:
            user_db = UserDB(
                id=str(uuid.uuid4()),
                login=new_user.login,
                password_hash=create_hash(new_user.password),
                email=new_user.email,
                tg_nickname=new_user.tg_nickname,
                role=new_user.role
            )

            session.add(user_db)
            try:
                session.commit()
                return True

            except IntegrityError:
                return False

    def sign_in(self, login, password_hash):
        with Session(engine) as session:
            query = select(UserDB).where(UserDB.login == login, UserDB.password_hash == password_hash)
            res = session.exec(query).first()  # получить айдишник юзера. None если такой нет
            if res:
                return True
            else:
                return False