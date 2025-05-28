from fastapi import APIRouter, Depends, HTTPException, status

from backend.src.api.dto.user import UserCreate
from backend.src.api.dependencies import get_user_service, get_user_id
from backend.src.application.services.user_service import UserService
from backend.src.domain.exceptions import ObjectAlreadyExistsError, AccessDeniedError
from backend.src.domain.models.user import TokenRead
from backend.src.legacy.db_models.api_models import NewUser, SigninUser, PatchUser


router = APIRouter()

@router.post("/signup", summary="Регистрация", description="Первоначальная регистрация на платформе")
async def add_new_user(new_user: UserCreate, service: UserService = Depends(get_user_service)):
    try:
        return await service.create_user(new_user)
    except ObjectAlreadyExistsError:
        raise HTTPException(status_code=403)

@router.post("/signin", summary="Вход по логину/паролю", description="Вход по кредам и получение токена")
async def sign_in_user(user: SigninUser, service: UserService = Depends(get_user_service)):
    try:
        return await service.sign_in_user(user)
    except AccessDeniedError:
        raise HTTPException(status_code=403)

@router.get("/data", summary="Информация", description="Все данные пользователя кроме конфиденциальных")
def get_user_data(user_id: str = Depends(get_user_id)):
    return user_service.get_user_data(user_id)

@router.patch("/patch", summary="Изменение данных", description="Изменение данных юзера")
def patch_user(user: PatchUser, user_id: str = Depends(get_user_id)):
    return user_service.patch_user(user, user_id)

@router.delete("/delete", summary="Удаление профиля", description="Удаление пользователя из бд")
def delete_user(user_id: str = Depends(get_user_id)):
    return user_service.delete_user(user_id)