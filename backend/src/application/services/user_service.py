from domain.exceptions import ObjectNotFoundError
from domain.interfaces.hash_creator import HashCreator
from domain.interfaces.token_creator import TokenCreator
from domain.models.user import UsersCreate, TokenPair, UsersRead, UsersUpdate
from domain.interfaces.repositories.user_repository import UserRepository

from domain.interfaces.oauth_provider import OAuthProvider

from domain.models.user import OAuthAccountCreate

from infrastructure.oauth.oauth_provider_factory import OAuthProviderFactory



class UsersService:
    def __init__(self, repository: UserRepository, token_creator: TokenCreator, hash_creator: HashCreator, provider_factory: OAuthProviderFactory):
        self.repository = repository
        self.token_creator = token_creator
        self.hash_creator = hash_creator
        self.provider_factory = provider_factory

    async def create_user(self, new_user_api) -> TokenPair:
        # print(new_user_api)
        new_user = UsersCreate(
            login=new_user_api.login,
            password_hash= await self.hash_creator.create_hash(password=new_user_api.password),
            email=new_user_api.email,
            tg_nickname=new_user_api.tg_nickname,
        )
        user_read = await self.repository.create(new_user)
        access_token = await self.token_creator.create_access_token(user_read.id)
        refresh_token = await self.token_creator.create_refresh_token(user_read.id)
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_read.id
        )

    async def sign_in_user(self, user) -> TokenPair:
        user_read = await self.repository.get_by_login(user.login)
        if user_read.password_hash == await self.hash_creator.create_hash(user.password):
            access_token = await self.token_creator.create_access_token(user_read.id)
            refresh_token = await self.token_creator.create_refresh_token(user_read.id)
            return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_read.id
        )

        else:
            raise ObjectNotFoundError

    async def get_user(self, user_id: str) -> UsersRead:
        user_read = await self.repository.get(user_id)
        return user_read

    async def update_user(self, user_update: UsersUpdate, password) -> UsersRead:
        # user_db = self.repository.get(user.user_id)
        if password:
            user_update.password_hash = await self.hash_creator.create_hash(password)
        user_read = await self.repository.update(user_update)
        return user_read

    async def delete_user(self, user_id) -> bool:
        try:
            res = await self.repository.delete(user_id)
        except:
            raise ObjectNotFoundError
        return res

    async def get_users_by_ids(self, ids):
        return await self.repository.get_users_by_ids(ids)

    async def refresh_token(self, refresh_token):
        user_id = await self.token_creator.verify_refresh_token(refresh_token)
        new_access = await self.token_creator.create_access_token(user_id)
        new_refresh = await self.token_creator.create_refresh_token(user_id)
        return TokenPair(
            access_token=new_access,
            refresh_token=new_refresh,
            user_id=user_id)

    async def login_with_oauth(self, provider_name: str, code: str) -> TokenPair:
        # Получение нужного провайдера из фабрики
        provider = self.provider_factory.get(provider_name)
        # Получение данных пользователя от внешнего провайдера
        user_data = await provider.get_user_info(code)
        print(user_data["provider"], user_data["id"])
        # Попытка найти пользователя
        try:
            user = await self.repository.get_by_provider_id(user_data["provider"], user_data["id"])

        except ObjectNotFoundError:
            # Если пользователя нет, он создается
            new_user = OAuthAccountCreate(
                login=user_data["name"],
                email=user_data["email"],
                tg_nickname=None, # потом при изменении юзера можно добавить
                provider=user_data["provider"],
                provider_id=user_data["id"],
            )
            user = await self.repository.create_with_oauth(new_user)

        # Генерация JWT
        access_token = await self.token_creator.create_access_token(user.id)
        refresh_token = await self.token_creator.create_refresh_token(user.id)
        # print(access_token, refresh_token, user.id)

        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id
        )