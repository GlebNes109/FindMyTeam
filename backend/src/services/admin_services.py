from starlette.responses import JSONResponse

from backend.src.config import settings
from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error

repository = Repository()

class AdminService():
    def add_event(self, new_event, admin_id):
        admin_db = repository.get_user_by_id(admin_id)

        if admin_db.role not in settings.admins:
            return make_http_error(403, "не админ")

        res = repository.add_new_event(new_event)

        if not res:
            return make_http_error(409, "ивент с такими данными уже есть")

        return JSONResponse(status_code=201, content=None)