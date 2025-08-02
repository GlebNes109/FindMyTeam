from sqladmin import ModelView

from infrastructure.db.db_models.events import EventsDB, EventTracksDB
from infrastructure.db.db_models.teamrequests import TeamRequestsDB
from infrastructure.db.db_models.teams import TeamsDB, TeamMembersDB, TeamVacanciesDB
from infrastructure.db.db_models.participants import ParticipantsDB

from infrastructure.db.db_models.user import UsersDB


class EventsAdmin(ModelView, model=EventsDB):
    column_list = [EventsDB.id, EventsDB.name, EventsDB.start_date, EventsDB.end_date]
    column_searchable_list = [EventsDB.name, EventsDB.description]

class EventTracksAdmin(ModelView, model=EventTracksDB):
    column_list = [EventTracksDB.id, EventTracksDB.event_id, EventTracksDB.name]

class TeamsAdmin(ModelView, model=TeamsDB):
    column_list = [TeamsDB.id, TeamsDB.name, TeamsDB.event_id, TeamsDB.teamlead_id]

class TeamMembersAdmin(ModelView, model=TeamMembersDB):
    column_list = [TeamMembersDB.id, TeamMembersDB.team_id, TeamMembersDB.participant_id]

class TeamVacanciesAdmin(ModelView, model=TeamVacanciesDB):
    column_list = [TeamVacanciesDB.id, TeamVacanciesDB.team_id, TeamVacanciesDB.event_track_id]

class TeamRequestsAdmin(ModelView, model=TeamRequestsDB):
    column_list = [
        TeamRequestsDB.id,
        TeamRequestsDB.vacancy_id,
        TeamRequestsDB.participant_id,
        TeamRequestsDB.approved_by_teamlead,
        TeamRequestsDB.approved_by_participant,
        TeamRequestsDB.is_active
    ]

class ParticipantsAdmin(ModelView, model=ParticipantsDB):
    column_list = [
        ParticipantsDB.id,
        ParticipantsDB.event_id,
        ParticipantsDB.user_id,
        ParticipantsDB.track_id,
        ParticipantsDB.event_role,
    ]

class UserAdmin(ModelView, model=UsersDB):
    column_list = [UsersDB.id, UsersDB.login, UsersDB.email, UsersDB.tg_nickname, UsersDB.role]
    form_columns = ["login", "email", "tg_nickname", "role"]
