
from fastapi.responses import JSONResponse

from backend.src.domain.exceptions import AccessDeniedError, ObjectNotFoundError
from backend.src.domain.interfaces.hash_creator import HashCreator
from backend.src.domain.interfaces.token_creator import TokenCreator
from backend.src.domain.models.user import UserCreate, TokenRead, UserRead, UserUpdate
from backend.src.domain.interfaces.user_repository import UserRepository


class UserService:
    def __init__(self, repository: UserRepository, token_creator: TokenCreator, hash_creator: HashCreator):
        self.repository = repository
        self.token_creator = token_creator
        self.hash_creator = hash_creator

    async def create_user(self, new_user_api) -> TokenRead:
        print(new_user_api)
        new_user = UserCreate(
            login=new_user_api.login,
            password_hash= await self.hash_creator.create_hash(password=new_user_api.password),
            email=new_user_api.email,
            tg_nickname=new_user_api.tg_nickname,
        )
        user_read = await self.repository.create(new_user)
        token = await self.token_creator.create_token(user_read.id)
        return TokenRead(
            token=token,
            user_id=user_read.id
        )

    async def sign_in_user(self, user) -> TokenRead:
        try:
            user_read = await self.repository.get_by_login(user.login)
        except ObjectNotFoundError: # если нет пользователя с таким логином и паролем, доступ запрещен.
            raise AccessDeniedError

        token = await self.token_creator.create_token(user_id=user_read.id)

        if user_read.password_hash == await self.hash_creator.create_hash(user.password):
            return TokenRead(
            token=token,
            user_id=user_read.id
        )

        else:
            raise AccessDeniedError

    async def get_user(self, user_id: str) -> UserRead:
        user_read = await self.repository.get(user_id)
        return user_read

    async def update_user(self, user_update: UserUpdate, password) -> UserRead:
        # user_db = self.repository.get(user.user_id)
        user_update.password_hash = await self.hash_creator.create_hash(password)
        user_read = await self.repository.update(user_update)
        return user_read

    async def delete_user(self, user_id) -> bool:
        try:
            res = await self.repository.delete(user_id)
        except:
            raise ObjectNotFoundError
        return res