import uuid
from types import new_class

from sqlalchemy.exc import IntegrityError
from sqlmodel import SQLModel, Session, select
from sqlalchemy import create_engine

from backend.src.config import settings
from backend.src.models.api_models import NewUser, NewTeam, NewEvent
from backend.src.models.db_models import UsersDB, TeamsDB, EventsDB
from backend.src.services.utility_services import create_hash

DATABASE_URL = f"postgresql://{settings.postgres_username}:{settings.postgres_password}@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_database}"
engine = create_engine(DATABASE_URL)


class Repository:
    def __init__(self):
        try:
            # SQLModel.metadata.drop_all(engine)
            SQLModel.metadata.create_all(engine)
            self.add_super_admin()

        except Exception as e:
            print(e)

    def add_super_admin(self):
        with Session(engine) as session:
            query = select(UsersDB).where(UsersDB.role == "SUPER_ADMIN")
            res = session.exec(query).first()  # получить айдишник юзера. None если такой нет
            if not res:
                user_id = str(uuid.uuid4())
                user_db = UsersDB(
                    id=user_id,
                    login=settings.admin_login,
                    password_hash=create_hash(settings.admin_password),
                    email="test",
                    tg_nickname="secret",
                    role="SUPER_ADMIN"
                )

                session.merge(user_db)
                session.commit()

    def add_user(self, new_user: NewUser):
        with Session(engine) as session:
            user_id = str(uuid.uuid4())
            user_db = UsersDB(
                id=user_id,
                login=new_user.login,
                password_hash=create_hash(new_user.password),
                email=new_user.email,
                tg_nickname=new_user.tg_nickname,
            )

            session.add(user_db)
            try:
                session.commit()
                return user_id

            except IntegrityError:
                return None

    def sign_in(self, login, password_hash):
        with Session(engine) as session:
            query = select(UsersDB.id).where(UsersDB.login == login, UsersDB.password_hash == password_hash)
            res = session.exec(query).first()  # получить айдишник юзера. None если такой нет
            return res

    def get_user_by_id(self, user_id):
        with Session(engine) as session:
            query = select(UsersDB).where(UsersDB.id == user_id)
            res = session.exec(query).first()
            return res

    def patch_user(self, user_patch, user_id):
        with Session(engine) as session:
            query = select(UsersDB).where(UsersDB.id == user_id)
            user_db = session.exec(query).first()

            user_db.login = user_patch.login or user_db.login
            user_db.email = user_patch.email or user_db.email
            user_db.tg_nickname = user_patch.tg_nickname or user_db.tg_nickname

            if user_patch.password:
                user_db.password_hash = create_hash(user_patch.password)

            session.commit()
            session.refresh(user_db)

    def delete_user(self, user_id):
        with Session(engine) as session:
            query = select(UsersDB).where(UsersDB.id == user_id)
            user_db = session.exec(query).first()
            session.delete(user_db)
            session.commit()

    def add_new_team(self, new_team: NewTeam, teamlead_id, event_id):
        with Session(engine) as session:
            team_id = str(uuid.uuid4())
            team_db = TeamsDB(
                id=team_id,
                teamlead_id=teamlead_id,
                name=new_team.name,
                description=new_team.description,
                event_id=event_id,
            )

            session.add(team_db)

            try:
                session.commit()
                return True

            except IntegrityError:
                return False

    def add_new_event(self, new_event: NewEvent):
        with Session(engine) as session:
            event_id = str(uuid.uuid4())
            event_db = EventsDB(
                id=event_id,
                name=new_event.name,
                description=new_event.description,
                start_date=new_event.start_date,
                end_date=new_event.end_date
            )
            session.add(event_db)
            # session.commit()

            try:
                session.commit()
                return True

            except IntegrityError:
                return False

    def get_event_id_by_name(self, event_name):
        with Session(engine) as session:
            query = select(EventsDB.id).where(EventsDB.name == event_name)
            event_id = session.exec(query).first()
            return event_id