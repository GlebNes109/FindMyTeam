import time
import jwt
from datetime import datetime, timedelta
from backend.src.core.config import settings
from backend.src.domain.exceptions import UnauthorizedError
from backend.src.domain.interfaces.repositories.user_repository import UserRepository
from backend.src.domain.interfaces.token_creator import TokenCreator

class JWTTokenCreator(TokenCreator):
    def __init__(self, secret_key, algorithm, repository: UserRepository):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.repository = repository

    async def create_refresh_token(self, user_id: str) -> str:
        expire = time.time() + 60 * 60 * 24 * 7 # 7 дней
        to_encode = {"sub": user_id, "exp": expire, "type": "refresh"}
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    async def create_access_token(self, user_id: str) -> str:
        expire = time.time() + 15 * 60
        to_encode = {"sub": user_id, "exp": expire}
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    async def verify_refresh_token(self, token: str) -> str:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            user_id = payload.get("sub")
            if not await self.repository.get(user_id):
                raise jwt.PyJWTError
            return user_id

        except jwt.PyJWTError:
            raise UnauthorizedError
