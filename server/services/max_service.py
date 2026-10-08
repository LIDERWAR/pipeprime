import logging
from pathlib import Path
from typing import Optional
import httpx
from server.config import settings

logger = logging.getLogger("pipeprime.max")

class MaxService:
    def __init__(self):
        self.bot_token = settings.MAX_BOT_TOKEN
        self.chat_id = settings.MAX_CHAT_ID
        self.base_url = "https://platform-api2.max.ru"

    @property
    def is_configured(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    async def send_message(self, text: str) -> bool:
        """Send formatted message to MAX messenger (app/bot) channel."""
        if not self.is_configured:
            logger.info("[MAX MESSENGER MOCK - Bot not configured]\n" + text)
            return True

        url = f"{self.base_url}/messages"
        headers = {
            "Authorization": self.bot_token,
            "Content-Type": "application/json"
        }
        payload = {
            "chat_id": self.chat_id,
            "text": text
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code in (200, 201):
                    return True
                logger.error(f"MAX Messenger error {res.status_code}: {res.text}")
                return False
        except Exception as e:
            logger.error(f"Failed to send MAX message: {e}")
            return False

    async def send_document(self, file_path: Path, caption: str) -> bool:
        """Send attached file (e.g. project estimate) to MAX messenger."""
        if not self.is_configured:
            logger.info(f"[MAX MESSENGER MOCK - File {file_path.name}]\nCaption: {caption}")
            return True

        url = f"{self.base_url}/messages"
        headers = {
            "Authorization": self.bot_token
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with open(file_path, "rb") as f:
                    files = {"file": (file_path.name, f)}
                    data = {
                        "chat_id": self.chat_id,
                        "text": caption[:1000]
                    }
                    res = await client.post(url, data=data, files=files, headers=headers)
                    if res.status_code in (200, 201):
                        return True
                    logger.error(f"MAX sendDocument error {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to send document to MAX: {e}")
            return False

max_service = MaxService()
