import time
import jwt
from backend.src.core.config import settings
from backend.src.domain.interfaces.token_creator import TokenCreator

class JWTTokenCreator(TokenCreator):
    async def create_token(self, user_id):
        return str(jwt.encode({"sub": user_id, "exp": await self.calculate_token_TTL()}, settings.secret_key, algorithm=settings.algorithm))

    async def calculate_token_TTL(self):
        TTL = time.time() + 60 * 60 # время жизни токена
        return TTL