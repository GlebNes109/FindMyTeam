import hashlib
import time

from starlette.responses import JSONResponse
import jwt

from backend.src.config import settings


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