from fastapi import APIRouter, Depends

from backend.src.models.api_models import NewEvent, NewEventParticipant
from backend.src.services.event_management_service import EventManagementService
from backend.src.services.utility_services import get_user_id

router = APIRouter()
event_service = EventManagementService()

@router.get("/user/get_all_events", summary="Получение всех ивентов", description="Доступно для юзеров и админов")
def get_events():
    return event_service.get_events()

@router.post("/admin/add_event", summary="Добавление новых ивентов (мероприятий)", description="Доступно только админу")
def add_event(new_event: NewEvent, admin_id: str = Depends(get_user_id)):
    return event_service.add_event(new_event, admin_id)

@router.post("/user/registration", summary="Регистрация на мероприятие", description="-")
def registration_user(new_participant: NewEventParticipant, user_id: str = Depends(get_user_id)):
    return event_service.add_new_participant(new_participant, user_id)

@router.get("/user/get_user_events", summary="Получение ивентов на которые пользователь зарегистрирован", description="-")
def get_user_events(user_id: str = Depends(get_user_id)):
    return event_service.get_users_events(user_id)

@router.get("/user/get_event/{EventId}", summary="Получение ивента по id", description="-")
def get_event(EventId: str):
    return event_service.get_event_data(EventId)

@router.get("/user/get_user_participation/{ParticipantId}", summary="Получение ивента по id", description="-")
def get_event(ParticipantId: str):
    return event_service.get_participation_data(ParticipantId)