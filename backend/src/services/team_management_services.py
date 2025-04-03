from starlette.responses import JSONResponse

from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error

repository = Repository()

class TeamManagementService():
    def add_new_team(self, new_team, teamlead_id):
        user_db = repository.get_user_by_id(teamlead_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        event_id = repository.get_event_id_by_name(new_team.event_name)

        if not event_id:
            return make_http_error(404, "мероприятие не найдено")

        res = repository.add_new_team(new_team, teamlead_id, event_id)

        if not res:
            return make_http_error(409, "команда с такими данными уже есть")

        return JSONResponse(status_code=201, content=None)