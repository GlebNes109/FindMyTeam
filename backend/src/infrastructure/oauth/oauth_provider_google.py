from domain.interfaces.oauth_provider import OAuthProvider

from core.config import settings


class GoogleOAuthProvider(OAuthProvider):
    def __init__(self, oauth_client):
        self.client = oauth_client

    async def get_user_info(self, code) -> dict:
        token = await self.client.fetch_access_token(
            redirect_uri=f"{settings.frontend_url}/oauth/callback",
            code=code,
        )
        resp = await self.client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
            token=token)
        user_info = resp.json()
        return {
            "provider": "google",
            **user_info
        }
