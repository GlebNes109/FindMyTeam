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
            self.add_super_admin()

        except Exception as e:
            print(e)
            print('ОШИБКА БД - НЕ ПОДКЛЮЧЕНА')

    def add_super_admin(self):
        pass

    def add_user(self, new_user: NewUser):
        with Session(engine) as session:
            user_id = str(uuid.uuid4())
            user_db = UserDB(
                id=user_id,
                login=new_user.login,
                password_hash=create_hash(new_user.password),
                email=new_user.email,
                tg_nickname=new_user.tg_nickname,
                role=new_user.role
            )

            session.add(user_db)
            try:
                session.commit()
                return user_id

            except IntegrityError:
                return None

    def sign_in(self, login, password_hash):
        with Session(engine) as session:
            query = select(UserDB.id).where(UserDB.login == login, UserDB.password_hash == password_hash)
            res = session.exec(query).first()  # получить айдишник юзера. None если такой нет
            return res

    def get_user_by_id(self, user_id):
        with Session(engine) as session:
            query = select(UserDB).where(UserDB.id == user_id)
            res = session.exec(query).first()
            return res

    def patch_user(self, user_patch, user_id):
        with Session(engine) as session:
            query = select(UserDB).where(UserDB.id == user_id)
            user_db = session.exec(query).first()

            user_db.login = user_patch.login or user_db.login
            user_db.email = user_patch.email or user_db.email
            user_db.tg_nickname = user_patch.tg_nickname or user_db.tg_nickname
            user_db.role = user_patch.role or user_db.role

            if user_patch.password:
                user_db.password_hash = create_hash(user_patch.password)

            session.commit()
            session.refresh(user_db)

    def delete_user(self, user_id):
        with Session(engine) as session:
            query = select(UserDB).where(UserDB.id == user_id)
            user_db = session.exec(query).first()
            session.delete(user_db)
            session.commit()