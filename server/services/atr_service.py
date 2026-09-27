import secrets
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple
from server.config import settings
from server.database import save_atr_token, get_atr_token, record_atr_download

class ATRService:
    def __init__(self):
        self.file_path = settings.PROTECTED_ATR_PATH
        self.expire_hours = settings.ATR_TOKEN_EXPIRE_HOURS

    def create_access_token(
        self,
        lead_id: int,
        email: str,
        company: str,
        inn: str
    ) -> Tuple[str, datetime]:
        """Generate one-time/time-limited token for ATR 2026 download."""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=self.expire_hours)
        save_atr_token(token, lead_id, email, company, inn, expires_at)
        return token, expires_at

    def verify_and_claim_token(self, token: str) -> Optional[Path]:
        """Verify token validity, expiration, and return path to protected file."""
        record = get_atr_token(token)
        if not record:
            return None

        # Verify expiration
        expires_at = datetime.fromisoformat(record["expires_at"])
        if datetime.now() > expires_at:
            return None

        # Verify physical file existence
        if not self.file_path.exists():
            return None

        # Record download event
        record_atr_download(token)
        return self.file_path

atr_service = ATRService()
