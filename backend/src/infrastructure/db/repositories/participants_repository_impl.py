from backend.src.domain.interfaces.participants_repository import ParticipantsRepository
from backend.src.domain.models.models import CreateModelType, ReadModelType
from backend.src.domain.models.participants import ParticipantsUpdate, ParticipantsCreate, ParticipantsRead, \
    ParticipantsDomainModel
from backend.src.infrastructure.db.db_models.participants import ParticipantsDB
from backend.src.infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl


class ParticipantsRepositoryImpl(
    BaseRepositoryImpl[ParticipantsDB, ParticipantsDomainModel, ParticipantsCreate, ParticipantsUpdate],
    ParticipantsRepository):
    pass

    # async def create_participant(self, obj: ParticipantsCreate, user_id) -> ParticipantsRead: