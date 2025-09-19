from typing import Any, Protocol

from domain.interfaces.repositories.base_repository import BaseRepository
from domain.models.participants import ParticipantsCreate, ParticipantsUpdate, \
    ParticipantsBasicRead


class ParticipantsRepository(BaseRepository[Any, ParticipantsBasicRead, ParticipantsCreate, ParticipantsUpdate], Protocol):
    async def get_all_for_user(self, user_id: Any, limit: int, offset: int) -> list[ParticipantsBasicRead]: ...

    async def get_all_for_event(self, event_id: Any, limit: int, offset: int) -> list[ParticipantsBasicRead]: ...

    async def get_all_by_ids(self, ids: list[str]) -> list[ParticipantsBasicRead]: ...

    async def find_sorted(
            self,
            event_id: str,
            track_weights: dict[str, int],
            keywords: list[str]
    ) -> list[ParticipantsBasicRead]: ...