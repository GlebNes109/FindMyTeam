import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError

from backend.src.config import settings
from backend.src.routes import users
from src.services.utility_services import make_http_error

app = FastAPI()
# app.middleware("http")(metrics_middleware)

app.include_router(users.router, prefix="/user", tags=["User"])


@app.exception_handler(RequestValidationError)
async def raise_validation_error(request: Request, exc: RequestValidationError):
    return make_http_error(400, "ошибка в данных запроса")


if __name__ == "__main__":
    server_address = settings.server_address
    host, port = server_address.split(":")
    uvicorn.run(app, host=host, port=int(port))