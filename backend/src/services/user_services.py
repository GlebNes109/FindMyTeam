import jwt
from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from starlette.responses import JSONResponse

from backend.src.config import settings
from backend.src.models.api_models import UserData
from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error, create_jwt_token, calculate_token_TTL, create_hash, \
    get_token

repository = Repository()
class UserService():
    def add_new_user(self, new_user):
        if new_user.role in settings.admins:
            return make_http_error(400, "нельзя создать пользователя с ролью админ")

        user_id = repository.add_user(new_user) # проверка на успешное добавление
        if not user_id:
            return make_http_error(409, "пользователь с таким логином уже есть")

        token = create_jwt_token({"sub": user_id, "exp": calculate_token_TTL()})
        return JSONResponse(status_code=201, content={"token": token})

    def sign_in_user(self, user):
        user_id = repository.sign_in(user.login, create_hash(user.password))
        if user_id:
            token = create_jwt_token({"sub": user_id, "exp": calculate_token_TTL()})
            return JSONResponse(status_code=201, content={"token": token})
        else:
            return make_http_error(401, "Неверный email или пароль.")

    def get_user_data(self, user_id):
        user_db = repository.get_user_by_id(user_id)
        user = UserData(
            login=user_db.login,
            email=user_db.email,
            tg_nickname=user_db.tg_nickname,
            role=user_db.role
        )

        return JSONResponse(status_code=200, content=user.model_dump())

    def patch_user(self, user, user_id):
        user_db = repository.get_user_by_id(user_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        if user.role in settings.admins:
            return make_http_error(400, "пользователь не может стать админом")

        repository.patch_user(user, user_id)
        return JSONResponse(status_code=200, content="данные изменены успешно")

    def delete_user(self, user_id):
        user_db = repository.get_user_by_id(user_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        repository.delete_user(user_id)

        return JSONResponse(status_code=201, content=None)
