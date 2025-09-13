from domain.interfaces.oauth_provider import OAuthProvider

from infrastructure.oauth.oauth_provider_google import GoogleOAuthProvider
from infrastructure.oauth.registry import oauth


class OAuthProviderFactory:
    def __init__(self, oauth_instance=oauth):
        self.oauth = oauth_instance

    def get(self, name: str) -> "OAuthProvider":
        client = self.oauth.create_client(name)
        if not client:
            raise ValueError(f"Provider {name} not supported")

        if name == "google":
            return GoogleOAuthProvider(client)
        elif name == "github":
            pass
        else:
            raise ValueError(f"Provider {name} not implemented yet (!)")
