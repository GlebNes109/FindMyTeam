from fastapi import APIRouter, Depends

from backend.src.api.dependencies import get_user_id, get_participants_service
from backend.src.api.dto.participants import ParticipantsCreateAPI
from backend.src.application.services.participants_service import ParticipantsService

router = APIRouter()

@router.post("", summary="Регистрация на мероприятие", description="-")
async def create_participants(new_participant: ParticipantsCreateAPI, user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    return await service.create_participant(new_participant, user_id)

@router.get("", summary="Регистрация на мероприятие", description="-")
async def get_participants(user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    return await service.get_participants(user_id)


'''@router.get("", summary="Получение данных об участнике", description="-")
async def create_participants(new_participant: ParticipantsCreateAPI, user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    return await service.get_participant(new_participant, user_id)'''




'''EventService	создание и управление ивентами и треками
ParticipationService	регистрация пользователя в ивент, назначение ролей, работа с участниками
TeamService	создание команд, добавление участников, просмотр команд
VacancyService	создание вакансий, назначение скиллов ??? в команды
InvitationService	приглашения, отклики и их подтверждение ??? в команды
UsersService	регистрация, логин, токены'''