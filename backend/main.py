import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware

from backend.src.config import settings
from backend.src.routes import users, team, admin
from src.services.utility_services import make_http_error

app = FastAPI()
# app.middleware("http")(metrics_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/user", tags=["User"])
app.include_router(team.router, prefix="/team_management", tags=["Team management"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.exception_handler(RequestValidationError)
async def raise_validation_error(request: Request, exc: RequestValidationError):
    return make_http_error(400, "ошибка в данных запроса")


if __name__ == "__main__":
    server_address = settings.server_address
    host, port = server_address.split(":")
    uvicorn.run(app, host=host, port=int(port))