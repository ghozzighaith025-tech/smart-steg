from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://griddna:griddna_dev_secret@localhost:5432/griddna"
    model_version: str = "0.1.0"

    class Config:
        env_file = ".env"


settings = Settings()
