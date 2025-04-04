from fastapi import APIRouter, Depends

from backend.src.models.api_models import NewEvent
from backend.src.routes.users import user_service
from backend.src.services.admin_services import AdminService
from backend.src.services.utility_services import get_user_id

router = APIRouter()
admin_service = AdminService()

@router.post("/events/add_event", summary="Добавление новых ивентов (мероприятий)", description="Доступно только админу")
def add_event(new_event: NewEvent, admin_id: str = Depends(get_user_id)):
    return admin_service.add_event(new_event, admin_id)