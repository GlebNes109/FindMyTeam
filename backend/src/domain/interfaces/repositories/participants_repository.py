from typing import Any, Protocol

from backend.src.domain.interfaces.repositories.base_repository import BaseRepository
from backend.src.domain.models.participants import ParticipantsCreate, ParticipantsUpdate, \
    ParticipantsDomainModel


class ParticipantsRepository(BaseRepository[Any, ParticipantsDomainModel, ParticipantsCreate, ParticipantsUpdate], Protocol):
    pass
    async def get_all_for_user(self, user_id: Any, limit: int, offset: int) -> list[ParticipantsDomainModel]: ...

    '''async def create_participant(self, obj: ParticipantsCreate, user_id) -> ParticipantsRead:
        ...'''