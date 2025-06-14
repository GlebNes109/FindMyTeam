from typing import Any, Protocol

from backend.src.domain.interfaces.base_repository import BaseRepository
from backend.src.domain.models.participants import ParticipantsRead, ParticipantsCreate, ParticipantsUpdate, \
    ParticipantsDomainModel


class ParticipantsRepository(BaseRepository[Any, ParticipantsDomainModel, ParticipantsCreate, ParticipantsUpdate], Protocol):
    pass

    '''async def create_participant(self, obj: ParticipantsCreate, user_id) -> ParticipantsRead:
        ...'''