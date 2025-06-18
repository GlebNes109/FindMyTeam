from fastapi import APIRouter, Depends

from backend.src.api.dependencies import get_user_id, get_team_requests_service
from backend.src.api.dto.teamrequests import TeamRequestsCreateAPI
from backend.src.application.services.team_requests_service import TeamRequestsService
from backend.src.domain.models.teamrequests import TeamRequestsPartialCreate

router = APIRouter()



@router.post("", summary="Приглашение или отклик", description="-")
async def create_participants(new_team_request: TeamRequestsCreateAPI, user_id: str = Depends(get_user_id), service: TeamRequestsService = Depends(get_team_requests_service)):
    return await service.create(user_id, TeamRequestsPartialCreate(**new_team_request.model_dump()))