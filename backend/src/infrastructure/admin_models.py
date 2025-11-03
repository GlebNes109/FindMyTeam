from sqladmin import ModelView

from infrastructure.db.db_models.events import EventsDB, EventTracksDB
from infrastructure.db.db_models.teamrequests import TeamRequestsDB
from infrastructure.db.db_models.teams import TeamsDB, TeamMembersDB, TeamVacanciesDB
from infrastructure.db.db_models.participants import ParticipantsDB

from infrastructure.db.db_models.user import UsersDB


class EventsAdmin(ModelView, model=EventsDB):
    name = "Мероприятие"         # единственное число
    name_plural = "Мероприятия"  # множественное число
    column_list = [EventsDB.id, EventsDB.name, EventsDB.start_date, EventsDB.end_date]
    column_searchable_list = [EventsDB.name, EventsDB.description]
    form_columns = [EventsDB.name, EventsDB.description, EventsDB.start_date, EventsDB.end_date]

class EventTracksAdmin(ModelView, model=EventTracksDB):
    name = "Направление / трек"
    name_plural = "Направления / Треки"
    column_list = [EventTracksDB.id, EventTracksDB.event_id, EventTracksDB.name]
    form_columns = ["name", "event"]

class TeamsAdmin(ModelView, model=TeamsDB):
    name = "Команда"
    name_plural = "Команды"
    column_list = [TeamsDB.id, TeamsDB.name, TeamsDB.event_id, TeamsDB.teamlead_id]

class TeamMembersAdmin(ModelView, model=TeamMembersDB):
    name = "Участник команды"
    name_plural = "Участники команд"
    column_list = [TeamMembersDB.id, TeamMembersDB.team_id, TeamMembersDB.participant_id]

class TeamVacanciesAdmin(ModelView, model=TeamVacanciesDB):
    name = "Вакансия в команде"
    name_plural = "Вакансии в командах"
    column_list = [TeamVacanciesDB.id, TeamVacanciesDB.team_id, TeamVacanciesDB.event_track_id]

class TeamRequestsAdmin(ModelView, model=TeamRequestsDB):
    name = "Запрос в команду"
    name_plural = "Запросы в команду"
    column_list = [
        TeamRequestsDB.id,
        TeamRequestsDB.vacancy_id,
        TeamRequestsDB.participant_id,
        TeamRequestsDB.approved_by_teamlead,
        TeamRequestsDB.approved_by_participant,
        TeamRequestsDB.is_active
    ]

class ParticipantsAdmin(ModelView, model=ParticipantsDB):
    name = "Участник мероприятия"
    name_plural = "Участники мероприятий"
    column_list = [
        ParticipantsDB.id,
        ParticipantsDB.event_id,
        ParticipantsDB.user_id,
        ParticipantsDB.track_id,
        ParticipantsDB.event_role,
    ]

class UserAdmin(ModelView, model=UsersDB):
    name = "Пользователь"
    name_plural = "Пользователи"
    column_list = [UsersDB.id, UsersDB.login, UsersDB.email, UsersDB.tg_nickname, UsersDB.role]
    form_columns = ["login", "email", "tg_nickname", "role"]
