from sqlalchemy.exc import IntegrityError
from starlette.responses import JSONResponse

from backend.src.config import settings
from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error, create_jwt_token, calculate_token_TTL, create_hash

repository = Repository()
class UserService():
    def add_new_user(self, new_user):
        if new_user.role in settings.admins:
            return make_http_error(400, "нельзя создать пользователя с ролью админ")

        res = repository.add_user(new_user) # проверка на успешное добавление
        if not res:
            return make_http_error(409, "пользователь с таким логином уже есть")

        token = create_jwt_token({"sub": new_user.login, "exp": calculate_token_TTL()})
        return JSONResponse(status_code=201, content={"token": token})

    def sign_in_user(self, user):
        res = repository.sign_in(user.login, create_hash(user.password))
        if res:
            token = create_jwt_token({"sub": user.login, "exp": calculate_token_TTL()})
            return JSONResponse(status_code=201, content={"token": token})
        else:
            return make_http_error(401, "Неверный email или пароль.")