from fastapi import APIRouter, Depends
from backend.src.api.dependencies import get_teams_service

router = APIRouter()

@router.get("/{TeamId}", summary="Регистрация", description="Первоначальная регистрация на платформе")
async def add_new_user(TeamId: str, service = Depends(get_teams_service)):
    return await service.get_detailed(TeamId)