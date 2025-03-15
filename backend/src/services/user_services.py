from backend.src.config import settings
from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error

repository = Repository()
class UserService():
    def add_new_user(self, new_user):
        if new_user.role in settings.admins:
            return make_http_error(400, "нельзя создать пользователя с ролью админ")

        repository.add_user(new_user)
