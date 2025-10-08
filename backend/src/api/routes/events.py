from fastapi import APIRouter, Depends, Query

from api.dependencies import get_user_id, get_event_service, get_user_service, get_teams_service, \
    get_participants_service
from api.dto.events import EventsCreateAPI
from application.services.events_service import EventsService
from application.services.participants_service import ParticipantsService
from application.services.teams_service import TeamsService
from application.services.user_service import UsersService

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

@router.get("/{EventId}/teams", summary="Получение команд", description="Доступно для юзеров и админов")
async def get_events(EventId: str, service: TeamsService = Depends(get_teams_service)):
    return await service.get_detailed_teams(EventId)

@router.get("/{EventId}/participants", summary="Получение участников мероприятия", description="Доступно для юзеров и админов")
async def get_events(EventId: str, service: ParticipantsService = Depends(get_participants_service), relevant_sort: bool = False, team_id: str | None = None, page: int = Query(2, ge=1, le=100),
    per_page: int = Query(0, ge=0)):
    return await service.get_event_participants(EventId, relevant_sort,
                                                team_id, page, per_page)  # использован participants сервис, так как участники - его зона ответственности

@router.get("/{EventId}/vacancies", summary="Получение вакансий мероприятия", description="Получение вакансий с релевантной сортировкой для участников без команды")
async def get_event_vacancies(EventId: str, service: TeamsService = Depends(get_teams_service), relevant_sort: bool = False, participant_id: str | None = None):
    return await service.get_event_vacancies(
        EventId, relevant_sort, participant_id)  # использован teams сервис, так как вакансии - его зона ответственности
