from fastapi import APIRouter, Depends

from application.services.admin_services import AdminService
from legacy.db_models.api_models import NewEvent
from domain.services.utility_services import get_user_id

router = APIRouter()
admin_service = AdminService()

@router.post("/", summary="Добавление новых ивентов (мероприятий)", description="Доступно только админу")
def add_event(new_event: NewEvent, admin_id: str = Depends(get_user_id)):
    pass