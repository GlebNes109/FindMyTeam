from typing import Protocol


class OAuthProvider(Protocol):
    async def get_user_info(self, code: str) -> dict: ...
