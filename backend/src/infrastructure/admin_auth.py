from sqladmin.authentication import AuthenticationBackend
from fastapi.requests import Request

from core.config import settings


class AuthAdmin(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        if username == settings.admin_login and password == settings.admin_password:
            request.session['user'] = username
            return True
        return False

    async def logout(self, request: Request):
        request.session.pop('user', None)

    async def authenticate(self, request: Request) -> bool:
        return 'user' in request.session