from http.client import HTTPException

import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware

from backend.src.api.routes import users, events
from backend.src.core.config import settings
from backend.src.domain.exceptions import AppException
from fastapi.responses import JSONResponse
app = FastAPI()
# app.middleware("http")(metrics_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(events.router, prefix="/events", tags=["Events management"])

@app.exception_handler(RequestValidationError)
async def raise_validation_error(request: Request, exc: RequestValidationError):
    return HTTPException(400, "ошибка в данных запроса")

@app.exception_handler(AppException)
async def handle_app_exception(request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

if __name__ == "__main__":
    server_address = settings.server_address
    host, port = server_address.split(":")
    uvicorn.run(app, host=host, port=int(port))