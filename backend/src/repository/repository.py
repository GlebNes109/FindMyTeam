import uuid
from types import new_class

from sqlalchemy.exc import IntegrityError
from sqlmodel import SQLModel, Session, select
from sqlalchemy import create_engine

from backend.src.config import settings
from backend.src.models.api_models import NewUser, NewTeam, NewEvent, EventData, EventTrackData, NewEventParticipant, \
    UserEventsData, TeamData, ParticipationData, VacancyData
from backend.src.models.db_models import UsersDB, TeamsDB, EventsDB, EventTracksDB, EventParticipantsDB, TeamMembersDB, \
    TeamVacanciesDB
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
            for i in range(len(new_event.event_tracks)):
                event_track = EventTracksDB(
                    id=str(uuid.uuid4()),
                    event_id=event_id,
                    name=new_event.event_tracks[i].name
                )
                session.add(event_track)

            session.add(event_db)
            # session.commit()

            try:
                session.commit()
                return True

            except IntegrityError:
                return False

    def get_events(self, limit, offset):
        with Session(engine) as session:
            query = select(EventsDB.id).order_by(EventsDB.name)
            events = session.exec(query).all()

            all_events = []

            for event_id in events:
                api_event = self.get_event_by_id(event_id)
                '''tracks = session.exec(select(EventTracksDB).where(EventTracksDB.event_id == event_db.id)).all()

                api_event = EventData(
                    id=event_db.id,
                    name=event_db.name,
                    description=event_db.description,
                    start_date=event_db.start_date,
                    end_date=event_db.end_date,
                    event_tracks=[EventTrackData(id=track.id,name=track.name) for track in tracks]
                )'''
                all_events.append(api_event.model_dump())

        return all_events

    def add_new_participant(self, new_participant: NewEventParticipant, user_id):
        with Session(engine) as session:

            track = session.exec(select(EventTracksDB).where(EventTracksDB.id == new_participant.track_id and EventTracksDB.event_id == new_participant.event_id)).first()

            if not track:
                return None

            participant_id = str(uuid.uuid4())
            participant_db = EventParticipantsDB(
                id=participant_id,
                event_id=new_participant.event_id,
                user_id=user_id,
                track_id=new_participant.track_id,
                event_role=new_participant.event_role,
                resume=new_participant.resume
            )

            if new_participant.team:
                team_id = str(uuid.uuid4())

                team_db = TeamsDB(
                    id=team_id,
                    name=new_participant.team.name,
                    event_id=new_participant.event_id,
                    teamlead_id=participant_id,
                    description=new_participant.team.description
                )

                if new_participant.team.vacancies:
                    for vacancy in new_participant.team.vacancies:
                        vacancy_db = TeamVacanciesDB(
                            id=str(uuid.uuid4()),
                            team_id=team_id,
                            event_track_id=vacancy.event_track_id,
                            description=vacancy.description
                        )
                        session.add(vacancy_db)

                team_member = TeamMembersDB(
                    id=str(uuid.uuid4()),
                    team_id=team_id,
                    participant_id=participant_id
                )

                session.add(team_db)
                session.add(team_member)

            session.add(participant_db)
            session.commit()
            return participant_id

    def get_user_events(self, user_id):
        with Session(engine) as session:
            query = select(EventsDB).join(EventParticipantsDB, EventParticipantsDB.event_id == EventsDB.id).where(EventParticipantsDB.user_id == user_id)
            events = session.exec(query).all()
            all_events = []

            participants_db = session.exec(select(EventParticipantsDB).where(EventParticipantsDB.event_id == EventsDB.id)).all()

            for event_db, participant_db in zip(events, participants_db):
                tracks = session.exec(select(EventTracksDB).where(EventTracksDB.event_id == event_db.id)).all()
                participant_track = session.exec(select(EventTracksDB).where(EventTracksDB.event_id == event_db.id and EventTracksDB.id == participant_db.track_id)).first().name
                api_event = UserEventsData(
                    id=event_db.id,
                    name=event_db.name,
                    description=event_db.description,
                    start_date=event_db.start_date,
                    end_date=event_db.end_date,
                    event_tracks=[EventTrackData(id=track.id, name=track.name) for track in tracks],
                    participant_id=participant_db.id,
                    event_role=participant_db.event_role,
                    resume=participant_db.resume,
                    participant_track=participant_track
                )
                all_events.append(api_event.model_dump())

            return all_events

    def get_event_by_id(self, event_id):
        with (Session(engine) as session):
            event_db = session.exec(select(EventsDB).where(EventsDB.id == event_id)).first()
            if event_db == None:
                return None

            teams = session.exec(select(TeamsDB).where(TeamsDB.event_id == event_id)).all()

            event_teams = []

            for team in teams:
                vacancies_db = session.exec(select(TeamVacanciesDB).where(TeamVacanciesDB.team_id == team.id)).all()
                team_members = session.exec(
                    select(EventParticipantsDB)
                    .join(TeamMembersDB, TeamMembersDB.participant_id == EventParticipantsDB.id)
                    .where(TeamMembersDB.team_id == team.id)
                ).all()
                # track = session.exec(select(EventTracksDB).where(EventTracksDB.event_id == event_db.id)).first()
                members = []
                vacancies = []

                for member_db in team_members:
                    login = session.exec(select(UsersDB.login).where(UsersDB.id == member_db.user_id)).first()
                    member_track = session.exec(select(EventTracksDB).where(EventTracksDB.id == member_db.track_id)).first()
                    member = ParticipationData(
                        participant_id=member_db.id,
                        login=login,
                        track=EventTrackData(id=member_track.id, name=member_track.name),
                        event_role=member_db.event_role,
                        resume=member_db.resume
                    )
                    members.append(member)

                for vacancy_db in vacancies_db:
                    vacancy_track = session.exec(select(EventTracksDB).where(EventTracksDB.id == vacancy_db.event_track_id)).first()
                    vacancy = VacancyData(
                        id=vacancy_db.id,
                        track=EventTrackData(id=vacancy_track.id, name=vacancy_track.name),
                        description=vacancy_db.description
                    )
                    vacancies.append(vacancy)

                team = TeamData(
                    id=team.id,
                    name=team.name,
                    description=team.description,
                    members=members,
                    vacancies=vacancies
                )

                event_teams.append(team)

            tracks = session.exec(select(EventTracksDB).where(EventTracksDB.event_id == event_db.id)).all()

            participants_db = session.exec(
                select(EventParticipantsDB)
                .where(EventParticipantsDB.event_id == event_id)
            ).all()

            event_participants = []

            for participant_db in participants_db:
                login = session.exec(select(UsersDB.login).where(UsersDB.id == participant_db.user_id)).first()
                participant_track = session.exec(
                    select(EventTracksDB).where(EventTracksDB.id == participant_db.track_id)).first()
                participant = ParticipationData(
                    participant_id=participant_db.id,
                    login=login,
                    track=EventTrackData(id=participant_track.id, name=participant_track.name),
                    event_role=participant_db.event_role,
                    resume=participant_db.resume
                )
                event_participants.append(participant)

            api_event = EventData(
                id=event_db.id,
                name=event_db.name,
                description=event_db.description,
                start_date=event_db.start_date,
                end_date=event_db.end_date,
                event_tracks=[EventTrackData(id=track.id, name=track.name) for track in tracks],
                event_teams=event_teams,
                event_participants=event_participants,)
            return api_event

    def get_participant_data(self, participant_id):
        with Session(engine) as session:
            participant = session.exec(select(EventParticipantsDB).where(EventParticipantsDB.id == participant_id)).first()

            login = session.exec(select(UsersDB.login).where(UsersDB.id == participant.user_id)).first()
            participant_track = session.exec(
                select(EventTracksDB).where(EventTracksDB.id == participant.track_id)).first()
            participant = ParticipationData(
                participant_id=participant.id,
                login=login,
                track=EventTrackData(id=participant_track.id, name=participant_track.name),
                event_role=participant.event_role,
                resume=participant.resume
            )
            return participant