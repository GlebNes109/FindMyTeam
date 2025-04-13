from starlette.responses import JSONResponse

from backend.src.config import settings
from backend.src.repository.repository import Repository
from backend.src.services.utility_services import make_http_error

repository = Repository()

class AdminService():
    pass