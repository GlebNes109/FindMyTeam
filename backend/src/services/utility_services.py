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
    return jwt.encode(data, settings.secret_key, algorithm=settings.algoruthm)