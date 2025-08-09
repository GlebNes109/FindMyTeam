from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, Response
from api.dependencies import get_teams_service

from domain.models.teams import TeamsUpdate

from api.dependencies import get_user_id

from domain.models.teams import VacanciesCreate

router = APIRouter()

@router.get("/{TeamId}", summary="Получение команды", description="Получение команды по ID")
async def add_new_user(TeamId: str, service = Depends(get_teams_service)):
    return await service.get_detailed(TeamId)

@router.patch("", summary="Пропатчить команду", description="Изменение команды по id, доступно только авторизованным пользователям, которые являются капитаном этой команды")
async def add_new_user(team: TeamsUpdate, user_id = Depends(get_user_id), service = Depends(get_teams_service)):
    return await service.update(team, user_id)

@router.delete("/vacancy/{VacancyId}", summary="Удалить вакансию в команде", description="Принудительное удаление вакансии, даже если на нее никто не нанят")
async def add_new_user(VacancyId: str, user_id = Depends(get_user_id), service = Depends(get_teams_service)):
    await service.delete_vacancy_teamleadcheck(VacancyId, user_id)
    return Response(status_code=204)

@router.post("/{TeamId}/vacancy", summary="Добавить новую вакансию", description="Добавить новую вакансию в свою команду")
async def add_new_user(TeamId: str, vacancy: VacanciesCreate, user_id = Depends(get_user_id), service = Depends(get_teams_service)):
    model = await service.create_vacancy_teamleadcheck(vacancy, user_id, TeamId)
    return JSONResponse(status_code=201, content=model.model_dump())

@router.delete("/{TeamId}", summary="Удалить команду", description="Удаление команды по id, доступно только авторизованным пользователям, которые являются капитаном этой команды")
async def add_new_user(TeamId: str, user_id = Depends(get_user_id), service = Depends(get_teams_service)):
    await service.delete(TeamId, user_id)
    return Response(status_code=204)

@router.delete("/{TeamId}/members/{ParticipantId}", summary="Выгнать участника", description="Выгнать участника по id")
async def delete_team_member(TeamId: str, ParticipantId: str, user_id = Depends(get_user_id), service = Depends(get_teams_service)):
    await service.delete_team_member(TeamId, ParticipantId, user_id)
    return Response(status_code=204)

@router.delete("/{TeamId}/leave/{ParticipantId}", summary="Уйти из команды", description="Уйти из команды, если вы не тимлид. Если вы тимлид, команда удаляется.")
async def delete_team_member(TeamId: str, ParticipantId: str, user_id = Depends(get_user_id), service = Depends(get_teams_service)):
    await service.leave_team(TeamId, ParticipantId, user_id)
    return Response(status_code=204)
