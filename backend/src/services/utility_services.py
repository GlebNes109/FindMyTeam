import hashlib
import time

from starlette.responses import JSONResponse
import jwt
from fastapi import Request, Depends, HTTPException, status
from backend.src.config import settings
from backend.src.repository.repository import Repository
from backend.src.services.user_services import repository


def make_http_error(code, text):
    return JSONResponse(
        status_code=code,
        content={
            "status": "error",
            "message": text
        })

def create_jwt_token(data: dict):
    return jwt.encode(data, settings.secret_key, algorithm=settings.algorithm)

def create_hash(password):
    sha256hash = hashlib.sha256()
    sha256hash.update(password.encode('utf-8'))
    return sha256hash.hexdigest()

def calculate_token_TTL():
    TTL = time.time() + 14400 # 4 часа
    return TTL

def get_token(request: Request):
    headers = request.headers
    a = str(headers.get("Authorization"))
    return a[7:]

def get_user(self, token: str = Depends(get_token)):
    repository = Repository()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")

        if not repository.get_user_by_id(user_id):
            raise jwt.PyJWTError

        return user_id

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не авторизован"
        )
        # raise make_http_error(401, "пользователь не авторизован")