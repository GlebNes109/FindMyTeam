from contextlib import asynccontextmanager
from sqlmodel import create_engine
import uvicorn
from fastapi import FastAPI, Request, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin, ModelView
from api.dependencies import get_hash_creator
from api.routes import users, events, participants, team_requests, teams
from infrastructure.admin_auth import AuthAdmin
from infrastructure.admin_models import (
    EventsAdmin, EventTracksAdmin, TeamsAdmin,
    TeamMembersAdmin, TeamVacanciesAdmin, TeamRequestsAdmin, ParticipantsAdmin, UserAdmin
)
from core.config import settings
from core.init_data import add_super_admin, create_tables
from domain.exceptions import AppException
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from infrastructure.db.session import async_session_maker

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
        "http://findmyteam.ru"
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

sync_engine = create_engine(
    f"postgresql://{settings.postgres_username}:{settings.postgres_password}@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_database}"
)

app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)


def setup_admin(app):
    admin = Admin(app, sync_engine, authentication_backend=AuthAdmin(settings.secret_key))
    admin.add_view(UserAdmin)
    admin.add_view(EventsAdmin)
    admin.add_view(EventTracksAdmin)
    admin.add_view(TeamsAdmin)
    admin.add_view(TeamMembersAdmin)
    admin.add_view(TeamVacanciesAdmin)
    admin.add_view(TeamRequestsAdmin)
    admin.add_view(ParticipantsAdmin)

setup_admin(app)
if __name__ == "__main__":
    server_address = settings.server_address
    setup_admin(app)
    host, port = server_address.split(":")
    uvicorn.run(app, host=host, port=int(port))
