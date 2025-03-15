from fastapi import APIRouter

from backend.src.models.api_models import NewUser
from backend.src.services.user_services import UserService

router = APIRouter()
user_service = UserService()

@router.post("/signup", summary="Регистрация", description="Первоначальная регистрация на платформе")
def add_new_user(new_user: NewUser):
    return user_service.add_new_user(new_user)