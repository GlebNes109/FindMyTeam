'''from fastapi import APIRouter, Depends

from legacy.db_models.api_models import NewUser, SigninUser, PatchUser
from domain.services.user_services import UsersService
from domain.services.utility_services import get_user_id

router = APIRouter()
user_service = UsersService()

@router.post("/signup", summary="Регистрация", description="Первоначальная регистрация на платформе")
def add_new_user(new_user: NewUser):
    return user_service.create_user(new_user)

@router.post("/signin", summary="Вход по логину/паролю", description="Вход по кредам и получение токена")
def sign_in_user(user: SigninUser):
    return user_service.sign_in_user(user)

@router.get("/data", summary="Информация", description="Все данные пользователя кроме конфиденциальных")
def get_user_data(user_id: str = Depends(get_user_id)):
    return user_service.get_user_data(user_id)

@router.patch("/patch", summary="Изменение данных", description="Изменение данных юзера")
def patch_user(user: PatchUser, user_id: str = Depends(get_user_id)):
    return user_service.update_user(user)

@router.delete("/delete", summary="Удаление профиля", description="Удаление пользователя из бд")
def delete_user(user_id: str = Depends(get_user_id)):
    return user_service.delete_user(user_id)'''