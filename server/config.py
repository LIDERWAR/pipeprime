import os
from pathlib import Path
from dotenv import load_dotenv

# Base directories
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Load .env file from server directory first, fallback to root
env_path = BASE_DIR / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

class Settings:
    # Server network settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pipeprime_super_secret_corporate_key_2026")
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "").strip()

    # SMTP Settings (optional)
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "").strip()
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "").strip()
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "").strip()
    SMTP_FROM: str = os.getenv("SMTP_FROM", "noreply@pipeprime.ru").strip()
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "info@pipeprime.ru").strip()

    # CORS
    raw_cors = os.getenv("CORS_ORIGINS", "*")
    if raw_cors == "*":
        CORS_ORIGINS: list[str] = ["*"]
    else:
        CORS_ORIGINS: list[str] = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

    # File paths
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOADS_DIR: Path = STORAGE_DIR / "uploads"
    PROTECTED_DIR: Path = STORAGE_DIR / "protected"
    PROTECTED_ATR_PATH: Path = PROTECTED_DIR / "Boilerberg_ATR_2026.pdf"
    DATA_DIR: Path = BASE_DIR / "data"
    DB_PATH: Path = DATA_DIR / "pipeprime.db"

    # ATR Token expiration (hours)
    ATR_TOKEN_EXPIRE_HOURS: int = 24

    def ensure_directories(self):
        """Ensure necessary directories exist"""
        self.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        self.PROTECTED_DIR.mkdir(parents=True, exist_ok=True)
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.ensure_directories()
