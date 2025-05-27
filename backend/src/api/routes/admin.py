from fastapi import APIRouter, Depends

from backend.src.legacy.models.api_models import NewEvent
from backend.src.domain.services.admin_services import AdminService
from backend.src.domain.services.utility_services import get_user_id

router = APIRouter()
admin_service = AdminService()

@router.post("/", summary="Добавление новых ивентов (мероприятий)", description="Доступно только админу")
def add_event(new_event: NewEvent, admin_id: str = Depends(get_user_id)):
    pass