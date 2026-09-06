"""Application settings loaded from environment variables."""
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    HUNAR_API_KEY: str = Field(..., env="HUNAR_API_KEY")
    HUNAR_BASE_URL: str = Field("https://api.voice.hunar.ai/external/v1", env="HUNAR_BASE_URL")
    
    # People Search APIs (Optional)
    PDL_API_KEY: Optional[str] = Field(None, env="PDL_API_KEY")
    
    DATABASE_URL: str = Field("sqlite+aiosqlite:///./hunar.db", env="DATABASE_URL")
    FRONTEND_ORIGIN: str = Field("http://localhost:3000", env="FRONTEND_ORIGIN")


settings = Settings()
