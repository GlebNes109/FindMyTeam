from fastapi import APIRouter, Depends, Query

from backend.src.api.dependencies import get_user_id, get_team_requests_service
from backend.src.api.dto.teamrequests import TeamRequestsCreateAPI
from backend.src.application.services.team_requests_service import TeamRequestsService
from backend.src.domain.exceptions import BadRequestError
from backend.src.domain.models.teamrequests import TeamRequestsPartialCreate

router = APIRouter()



@router.post("", summary="Приглашение или отклик", description="-")
async def create_team_request(new_team_request: TeamRequestsCreateAPI, user_id: str = Depends(get_user_id), service: TeamRequestsService = Depends(get_team_requests_service)):
    return await service.create(user_id, TeamRequestsPartialCreate(**new_team_request.model_dump()))

@router.get("/outgoing", summary="Получение исходящих запросов для тимлидов и обычных участников", description="Обычные участники получают отклики, тимлиды - приглашения")
async def get_team_request_outgoing(participant_id: str = Query(None, description="participant id"),
                           user_id: str = Depends(get_user_id),
                           service: TeamRequestsService = Depends(get_team_requests_service)):
    if participant_id is None:
        raise BadRequestError
    return await service.get_outgoing(participant_id, user_id)

@router.get("/incoming", summary="Получение входящих запросов для тимлидов и обычных участников", description="Обычные участники получают приглашения, тимлиды - отклики")
async def get_team_request_incoming(participant_id: str = Query(None, description="participant id"),
                           user_id: str = Depends(get_user_id),
                           service: TeamRequestsService = Depends(get_team_requests_service)):
    if participant_id is None:
        raise BadRequestError
    return await service.get_incoming(participant_id, user_id)

@router.put("/{RequestId}/accept", summary="подтвердить request", description="-")
async def get_team_request(# participant_id: str = Query(None, description="participant id"),
                           RequestId: str,
                           user_id: str = Depends(get_user_id),
                           service: TeamRequestsService = Depends(get_team_requests_service)):
    # if participant_id is None:
    #    raise BadRequestError
    return await service.accept_request(RequestId, user_id)