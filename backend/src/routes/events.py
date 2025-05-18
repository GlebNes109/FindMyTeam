from fastapi import APIRouter, Depends

from backend.src.models.api_models import NewEvent, NewEventParticipant, NewInvitation, NewResponse
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

@router.get("/user/get_user_participation/{ParticipantId}", summary="Получение данных об участии в мероприятии", description="Воспользоваться этим эндпоинтом может любой пользователь для просмотра данных о другом ползователе (или о себе). Это нужно например при наборе в команду чтобы прочитать резюме кандидата.")
def get_participation(ParticipantId: str):
    return event_service.get_participation_data(ParticipantId)

@router.post("/user/invite", summary="Создание нового приглашения в команду", description="-")
def add_invitation(new_invitation: NewInvitation, user_id: str = Depends(get_user_id)):
    return event_service.add_invitation(new_invitation, user_id)

@router.post("/user/respond", summary="Откликнуться", description="-")
def add_invitation(new_resp: NewResponse, user_id: str = Depends(get_user_id)):
    return event_service.add_response(new_resp, user_id)

@router.get("/user/get_responses/{ParticipantId}", summary="Получение всех откликов", description="Эндпоинт работает и для тимлидов, и для участников - для тимлида выводятся отклики на его вакансии, а для участника - его собственные отвлики, которые он сделал ранее.")
def get_responses(ParticipantId: str, user_id: str = Depends(get_user_id)):
    return event_service.get_responses(ParticipantId, user_id)

@router.get("/user/get_invitations/{ParticipantId}", summary="Получение всех откликов", description="Эндпоинт работает и для тимлидов, и для участников - для тимлида выводятся отклики на его вакансии, а для участника - его собственные отвлики, которые он сделал ранее.")
def get_responses(ParticipantId: str, user_id: str = Depends(get_user_id)):
    return event_service.get_invitations(ParticipantId, user_id)