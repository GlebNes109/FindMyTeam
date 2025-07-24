from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.responses import JSONResponse

from backend.src.api.dto.user import UserCreateAPI, UserReadAPI, UserUpdateAPI, TokenRead
from backend.src.api.dependencies import get_user_service, get_user_id, get_hash_creator
from backend.src.application.services.user_service import UsersService
from backend.src.domain.exceptions import ObjectAlreadyExistsError, AccessDeniedError, ObjectNotFoundError
from backend.src.domain.models.user import TokenPair, UsersUpdate
from backend.src.legacy.db_models.api_models import NewUser, SigninUser, PatchUser


router = APIRouter()

@router.post("/signup", summary="Регистрация", description="Первоначальная регистрация на платформе")
async def add_new_user(new_user: UserCreateAPI, service: UsersService = Depends(get_user_service)):
    data = await service.create_user(new_user)
    response = JSONResponse(content=data.model_dump())
    response.set_cookie("refresh_token", data.refresh_token, httponly=True, secure=True, samesite="strict")
    return response

@router.post("/signin", summary="Вход по логину/паролю", description="Вход по кредам и получение токена")
async def sign_in_user(user: SigninUser, service: UsersService = Depends(get_user_service)):
    data = await service.sign_in_user(user)
    response = JSONResponse(content=data.model_dump())
    response.set_cookie("refresh_token", data.refresh_token, httponly=True, secure=True, samesite="strict")
    return response

@router.get("", summary="Информация", description="Все данные пользователя кроме конфиденциальных")
async def get_user_data(user_id: str = Depends(get_user_id), service: UsersService = Depends(get_user_service)):
    user_read = await service.get_user(user_id)
    return UserReadAPI.from_user_read(user_read)

@router.patch("", summary="Изменение данных", description="Изменение данных юзера")
async def patch_user(user: UserUpdateAPI, user_id: str = Depends(get_user_id), service: UsersService = Depends(get_user_service)):
    user_update = UsersUpdate(**user.model_dump(), id=user_id) # в user update api нет id пользователя так как он берется из токена.
    # это делается здесь, так как это не бизнес логика, это зависит от того как формируется токен и передается user id
    return await service.update_user(user_update, user.password)

@router.delete("", summary="Удаление профиля", description="Удаление пользователя из бд")
async def delete_user(user_id: str = Depends(get_user_id), service: UsersService = Depends(get_user_service)):
    res = await service.delete_user(user_id)
    if res: # доп проверка что все норм
        return JSONResponse(status_code=204, content=None)

@router.post("/auth/refresh")
async def refresh_token(refresh_token: str = Cookie(...), service: UsersService = Depends(get_user_service)):
    data = await service.refresh_token(refresh_token)
    response = JSONResponse(content=data.model_dump())
    response.set_cookie("refresh_token", data.refresh_token, httponly=True, secure=True, samesite="strict")
    return TokenRead(
        access_token=data.access_token,
        user_id=data.user_id
    )