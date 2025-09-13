from domain.interfaces.oauth_provider import OAuthProvider

# использовать только для тестирования
class FakeGoogleOAuthProvider(OAuthProvider):
    async def get_user_info(self, code: str) -> dict:
        return {
            "provider": "google",
            "id": "1234567890",
            "email": "test@example.com",
            "name": "Test User",
        }
