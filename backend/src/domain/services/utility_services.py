import hashlib
import time

import jwt
from fastapi.responses import JSONResponse
from fastapi import Request, Depends, HTTPException, status
from backend.src.core.config import settings


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
    TTL = time.time() + 60 * 60 # 1 час
    return TTL

def get_token(request: Request):
    headers = request.headers
    a = str(headers.get("Authorization"))
    return a[7:]

def get_user_id(token: str = Depends(get_token)):
    from backend.src.legacy.repository.repository import Repository
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