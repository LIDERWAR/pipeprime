import logging
from pathlib import Path
from typing import Optional
import httpx
from server.config import settings

logger = logging.getLogger("pipeprime.telegram")

class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"

    @property
    def is_configured(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    async def send_message(self, text: str) -> bool:
        """Send formatted HTML message to Telegram channel/group."""
        if not self.is_configured:
            logger.info("[TELEGRAM MOCK - Bot not configured]\n" + text)
            return True

        url = f"{self.base_url}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    return True
                logger.error(f"Telegram error {res.status_code}: {res.text}")
                return False
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

    async def send_document(self, file_path: Path, caption: str) -> bool:
        """Send attached file (e.g. project estimate) to Telegram."""
        if not self.is_configured:
            logger.info(f"[TELEGRAM MOCK - File {file_path.name}]\nCaption: {caption}")
            return True

        url = f"{self.base_url}/sendDocument"
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with open(file_path, "rb") as f:
                    files = {"document": (file_path.name, f)}
                    data = {
                        "chat_id": self.chat_id,
                        "caption": caption[:1024],
                        "parse_mode": "HTML"
                    }
                    res = await client.post(url, data=data, files=files)
                    if res.status_code == 200:
                        return True
                    logger.error(f"Telegram sendDocument error {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to send document to Telegram: {e}")
            return False

telegram_service = TelegramService()
