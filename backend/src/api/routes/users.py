from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from backend.src.api.dto.user import UserCreateApi, UserReadApi, UserUpdateApi
from backend.src.api.dependencies import get_user_service, get_user_id, get_hash_creator
from backend.src.application.services.user_service import UserService
from backend.src.domain.exceptions import ObjectAlreadyExistsError, AccessDeniedError, ObjectNotFoundError
from backend.src.domain.models.user import TokenRead, UserUpdate
from backend.src.legacy.db_models.api_models import NewUser, SigninUser, PatchUser


router = APIRouter()

@router.post("/signup", summary="Регистрация", description="Первоначальная регистрация на платформе")
async def add_new_user(new_user: UserCreateApi, service: UserService = Depends(get_user_service)):
    try:
        return await service.create_user(new_user)
    except ObjectAlreadyExistsError:
        raise HTTPException(status_code=409)

@router.post("/signin", summary="Вход по логину/паролю", description="Вход по кредам и получение токена")
async def sign_in_user(user: SigninUser, service: UserService = Depends(get_user_service)):
    try:
        return await service.sign_in_user(user)
    except AccessDeniedError:
        raise HTTPException(status_code=403)

@router.get("/data", summary="Информация", description="Все данные пользователя кроме конфиденциальных")
async def get_user_data(user_id: str = Depends(get_user_id), service: UserService = Depends(get_user_service)):
    try:
        user_read = await service.get_user(user_id)
        return UserReadApi.from_user_read(user_read)
    except ObjectNotFoundError:
        raise HTTPException(status_code=404)

@router.patch("/patch", summary="Изменение данных", description="Изменение данных юзера")
async def patch_user(user: UserUpdateApi, user_id: str = Depends(get_user_id), service: UserService = Depends(get_user_service)):
    user_update = UserUpdate(**user.model_dump(), id=user_id) # в user update api нет id пользователя так как он берется из токена.
    # это делается здесь, так как это не бизнес логика, это зависит от того как формируется токен и передается user id
    try:
        return await service.update_user(user_update, user.password)
    except ObjectNotFoundError:
        raise HTTPException(status_code=404)

@router.delete("/delete", summary="Удаление профиля", description="Удаление пользователя из бд")
async def delete_user(user_id: str = Depends(get_user_id), service: UserService = Depends(get_user_service)):
    try:
        res = await service.delete_user(user_id)
        if res: # доп проверка что все норм
            return JSONResponse(status_code=204, content=None)
    except ObjectNotFoundError:
        raise HTTPException(status_code=404)