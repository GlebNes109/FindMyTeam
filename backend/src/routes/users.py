from fastapi import APIRouter

from backend.src.models.api_models import NewUser, SigninUser
from backend.src.services.user_services import UserService

router = APIRouter()
user_service = UserService()

@router.post("/signup", summary="Регистрация", description="Первоначальная регистрация на платформе")
def add_new_user(new_user: NewUser):
    return user_service.add_new_user(new_user)

@router.get("/login", summary="Вход по логину/паролю", description="Вход по кредам и получение токена")
def add_new_user(user: SigninUser):
    return user_service.sign_in_user(user)