
from authlib.integrations.starlette_client import OAuth

from core.config import settings

oauth = OAuth()
oauth.register(
    "google",
    client_id=settings.client_id_google,
    client_secret=settings.client_secret_google,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)