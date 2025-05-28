from typing import Protocol


class HashCreator(Protocol):
    async def create_hash(self, password: str) -> str: ...