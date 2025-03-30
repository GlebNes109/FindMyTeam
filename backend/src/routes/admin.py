from fastapi import APIRouter, Depends

router = APIRouter()

'''@router.post("/all_users", summary="Получение пользователей", description="Получение всех пользователей с пагинацией")
def get_all_users(user_id: str = Depends(user_service.get_user)):
    return user_service.add_new_user(new_user)'''