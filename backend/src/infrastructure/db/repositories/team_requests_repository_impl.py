from typing import Any
from sqlmodel import select
from domain.interfaces.repositories.team_requests_repository import TeamRequestsRepository
from domain.models.teamrequests import TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate
from infrastructure.db.db_models.teamrequests import TeamRequestsDB
from infrastructure.db.repositories.base_repository_impl import BaseRepositoryImpl

from sqlalchemy import select, and_, or_, true, false, null

class TeamRequestsRepositoryImpl(BaseRepositoryImpl[Any, TeamRequestsRead, TeamRequestsCreate, TeamRequestsUpdate],
                                 TeamRequestsRepository):
    async def get_all_with_params(self, approved_by_teamlead,
                                  approved_by_participant, participant_id=None, vacancies_ids=None) -> list[TeamRequestsRead]:
        conditions = [
            TeamRequestsDB.is_active == True
        ]

        if vacancies_ids is not None:
            conditions.append(TeamRequestsDB.vacancy_id.in_(vacancies_ids))

        if participant_id is not None:
            conditions.append(TeamRequestsDB.participant_id == participant_id)

        if approved_by_teamlead is not None:
            conditions.append(TeamRequestsDB.approved_by_teamlead == approved_by_teamlead)
        else:
            conditions.append(TeamRequestsDB.approved_by_teamlead.is_(None))

        if approved_by_participant is not None:
            conditions.append(TeamRequestsDB.approved_by_participant == approved_by_participant)
        else:
            conditions.append(TeamRequestsDB.approved_by_participant.is_(None))

        stmt = select(TeamRequestsDB).where(and_(*conditions))
        result = await self.session.execute(stmt)
        objs = result.scalars().all()
        return [self.read_schema.model_validate(obj, from_attributes=True) for obj in objs]
