from fastapi import APIRouter, Depends

from backend.src.api.dependencies import get_user_id, get_event_service, get_user_service
from backend.src.api.dto.events import EventsCreateAPI
from backend.src.application.services.events_service import EventsService
from backend.src.application.services.user_service import UserService

router = APIRouter()

@router.get("", summary="Получение всех ивентов", description="Доступно для юзеров и админов")
async def get_events(service: EventsService = Depends(get_event_service)):
    return await service.get_events()

@router.get("/{EventId}", summary="Получение всех ивентов", description="Доступно для юзеров и админов")
async def get_events(EventId: str, service: EventsService = Depends(get_event_service)):
    return await service.get_event(EventId)

@router.post("", summary="Добавление новых ивентов (мероприятий)", description="Доступно только админу")
async def add_event(new_event: EventsCreateAPI, admin_id: str = Depends(get_user_id), service: EventsService = Depends(get_event_service)):
    return await service.create_event(new_event, admin_id)

'''@router.delete("/{EventId}", summary="Получение всех ивентов", description="Доступно для юзеров и админов")
async def get_events(EventId: str, service: EventsService = Depends(get_event_service)):
    return await service.get_event(EventId)'''

'''@router.post("/user/registration", summary="Регистрация на мероприятие", description="-")
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
    return event_service.get_invitations(ParticipantId, user_id)'''