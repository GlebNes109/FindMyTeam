from fastapi import APIRouter, Depends

from backend.src.models.api_models import NewTeam
from backend.src.services.team_management_services import TeamManagementService
from backend.src.services.user_services import UserService
from backend.src.services.utility_services import get_user_id

router = APIRouter()
team_service = TeamManagementService()

@router.post("/add_team", summary="Добавление новой команды", description="Капитан добавляет новую команду")
def add_new_user(new_team: NewTeam, teamlead_id: str = Depends(get_user_id)):
    return team_service.add_new_team(new_team, teamlead_id)
