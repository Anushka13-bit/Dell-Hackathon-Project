from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hackathon Backend"
    VERSION: str = "0.1.0"
    
    # Security
    SECRET_KEY: str = "DEV_SECRET_KEY_CHANGE_IN_PROD"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3001",
        "http://192.168.1.110:3000",
        "http://192.168.1.110:3001"
    ]
    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "100/minute"
    
    # DB
    DATABASE_URL: str = "" # Supabase URL
    
    # LLM
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: Optional[str] = None
    
    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "allow"

settings = Settings()
