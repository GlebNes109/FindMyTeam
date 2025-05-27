
from starlette.responses import JSONResponse

from backend.src.domain.repositories.user_repository import UserRepository
from backend.src.legacy.models.api_models import UserData
from backend.src.legacy.repository.repository import Repository
from backend.src.domain.services.utility_services import make_http_error, create_jwt_token, calculate_token_TTL, create_hash

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
