
from fastapi.responses import JSONResponse

from backend.src.domain.exceptions import AccessDeniedError
from backend.src.domain.interfaces.hash_creator import HashCreator
from backend.src.domain.interfaces.token_creator import TokenCreator
from backend.src.domain.models.user import UserCreate, TokenRead
from backend.src.domain.interfaces.user_repository import UserRepository


class UserService:
    def __init__(self, repository: UserRepository, token_creator: TokenCreator, hash_creator: HashCreator):
        self.repository = repository
        self.token_creator = token_creator
        self.hash_creator = hash_creator

    async def create_user(self, new_user_api):
        print(new_user_api)
        new_user = UserCreate(
            login=new_user_api.login,
            password_hash= await self.hash_creator.create_hash(password=new_user_api.password),
            email=new_user_api.email,
            tg_nickname=new_user_api.tg_nickname,
        )
        user_db = await self.repository.create(new_user)
        token = await self.token_creator.create_token(user_db.id)
        return TokenRead(
            token=token,
            user_id=user_db.id
        )

    async def sign_in_user(self, user):
        try:
            user_db = await self.repository.get_by_login(user.login)
        except ValueError:
            raise AccessDeniedError

        token = await self.token_creator.create_token(user_id=user_db.id)

        if user_db.password_hash == await self.hash_creator.create_hash(user.password):
            return TokenRead(
            token=token,
            user_id=user_db.id
        )

        else:
            raise AccessDeniedError

    '''def get_user_data(self, user_id):
        user_db = repository.get_user_by_id(user_id)
        user = UserData(
            id=user_db.id,
            login=user_db.login,
            email=user_db.email,
            tg_nickname=user_db.tg_nickname,
            # role=user_db.role
        )

        return user

    def patch_user(self, user, user_id):
        user_db = repository.get_user_by_id(user_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        repository.patch_user(user, user_id)
        return JSONResponse(status_code=200, content="данные изменены успешно")

    def delete_user(self, user_id):
        user_db = repository.get_user_by_id(user_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        repository.delete_user(user_id)

        return JSONResponse(status_code=204, content=None)'''
