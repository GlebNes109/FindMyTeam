from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # database_url: str
    postgres_username: str
    postgres_password: str
    postgres_host: str
    postgres_port: int
    postgres_database: str
    server_address: str
    redis_host: str
    redis_port: int
    admins: list[str]
    secret_key: str
    algorithm: str
    class Config:
        env_file = ".env"

settings = Settings()