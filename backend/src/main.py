import asyncio
from contextlib import asynccontextmanager
from http.client import HTTPException
from fastapi.staticfiles import StaticFiles

import uvicorn
from fastapi import FastAPI, Request, Depends
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware

from api.dependencies import get_hash_creator
from api.routes import users, events, participants, team_requests, teams
from core.config import settings
from core.init_data import add_super_admin, create_tables
from domain.exceptions import AppException
from fastapi.responses import JSONResponse

from infrastructure.db.session import get_session, async_session_maker


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_session_maker() as session:
        hash_creator = get_hash_creator()
        await create_tables()
        await add_super_admin(hash_creator, session)
    yield

app = FastAPI(lifespan=lifespan)

# app.middleware("http")(metrics_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://http://glebnesyutin.fvds.ru",
        "http://http://glebnesyutin.fvds.ru:80"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# add_super_admin(hash_creator)
app.include_router(teams.router, prefix="/teams", tags=["Teams"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(events.router, prefix="/events", tags=["Events management"])
app.include_router(participants.router, prefix="/participants", tags=["Participants management"])
app.include_router(team_requests.router, prefix="/team_requests", tags=["Team requests management"])


@app.exception_handler(RequestValidationError)
async def raise_validation_error(request: Request, exc: RequestValidationError):
    return JSONResponse("ошибка в данных запроса", 400)

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
