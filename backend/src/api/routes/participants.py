from fastapi import APIRouter, Depends, Response

from api.dependencies import get_user_id, get_participants_service
from api.dto.participants import ParticipantsCreateAPI
from application.services.participants_service import ParticipantsService

from domain.models.participants import ParticipantsUpdate

from api.dto.participants import ParticipantsUpdateApi

router = APIRouter()

@router.post("", summary="Регистрация на мероприятие", description="-")
async def create_participants(new_participant: ParticipantsCreateAPI, user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    return await service.create_participant(new_participant, user_id)

@router.get("", summary="Получение участий", description="-")
async def get_participants(user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    return await service.get_participants(user_id)

@router.get("/{ParticipantsId}", summary="Получение участника", description="-")
async def get_participants(ParticipantsId: str, service: ParticipantsService = Depends(get_participants_service)):
    return await service.get_detail_participant(ParticipantsId)

@router.patch("", summary="Редактирование участника", description="-")
async def create_participants(update_participant: ParticipantsUpdateApi, user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    update_participant_domain = ParticipantsUpdate(**update_participant.model_dump())
    return await service.patch_participant(update_participant_domain, user_id)

'''@router.get("", summary="Получение данных об участнике", description="-")
async def create_participants(new_participant: ParticipantsCreateAPI, user_id: str = Depends(get_user_id), service: ParticipantsService = Depends(get_participants_service)):
    return await service.get_participant(new_participant, user_id)'''




'''EventService	создание и управление ивентами и треками
ParticipationService	регистрация пользователя в ивент, назначение ролей, работа с участниками
TeamService	создание команд, добавление участников, просмотр команд
VacancyService	создание вакансий, назначение скиллов ??? в команды
InvitationService	приглашения, отклики и их подтверждение ??? в команды
UsersService	регистрация, логин, токены'''