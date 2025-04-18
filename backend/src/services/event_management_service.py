from starlette.responses import JSONResponse

from backend.src.config import settings
from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error

repository = Repository()

class EventManagementService():
    def add_new_team(self, new_team, teamlead_id):
        user_db = repository.get_user_by_id(teamlead_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        res = repository.add_new_team(new_team, teamlead_id, new_team.event_id)

        if not res:
            return make_http_error(409, "команда с такими данными уже есть")

        return JSONResponse(status_code=201, content=None)

    def get_events(self, limit=10, offset=10):
        all_events = repository.get_events(limit, offset)

        return JSONResponse(status_code=200, content=all_events)

    def add_event(self, new_event, admin_id):
        admin_db = repository.get_user_by_id(admin_id)

        if admin_db.role not in settings.admins:
            return make_http_error(403, "не админ")

        res = repository.add_new_event(new_event)

        if not res:
            return make_http_error(409, "ивент с такими данными уже есть")

        return JSONResponse(status_code=201, content=None)

    def add_new_participant(self, new_participant, user_id):
        result = repository.add_new_participant(new_participant, user_id)
        if not result:
            return JSONResponse(status_code=400, content=None)

        return JSONResponse(status_code=201, content={"participant_id": result})

    def get_users_events(self, user_id):
        user_events = repository.get_user_events(user_id)
        # if not user_events:
        #    return make_http_error(404, "ивентов нет")
        return JSONResponse(status_code=200, content=user_events)

    def get_event_data(self, event_id):
        event = repository.get_event_by_id(event_id)
        if not event:
            return make_http_error(404, "ивента нет")
        return JSONResponse(status_code=200, content=event.model_dump())

    def get_participation_data(self, ParticipantId):
        participant_data = repository.get_participant_data(ParticipantId)
        return JSONResponse(status_code=200, content=participant_data.model_dump())
