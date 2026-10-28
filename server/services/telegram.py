import logging
from pathlib import Path
from typing import Optional, List
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

    def get_chat_ids(self) -> List[str]:
        if not self.chat_id:
            return []
        return [cid.strip() for cid in str(self.chat_id).split(",") if cid.strip()]

    async def send_message(self, text: str) -> bool:
        """Send formatted HTML message to Telegram channels/groups/users."""
        if not self.is_configured:
            logger.info("[TELEGRAM MOCK - Bot not configured]\n" + text)
            return True

        url = f"{self.base_url}/sendMessage"
        overall_success = True
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                for cid in self.get_chat_ids():
                    payload = {
                        "chat_id": cid,
                        "text": text,
                        "parse_mode": "HTML",
                        "disable_web_page_preview": True
                    }
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        logger.info(f"Telegram message sent successfully to chat_id {cid}")
                    else:
                        logger.error(f"Telegram error {res.status_code} for chat {cid}: {res.text}")
                        overall_success = False
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

        return overall_success

    async def send_document(self, file_path: Path, caption: str) -> bool:
        """Send attached file (e.g. project estimate) to Telegram channels/groups/users."""
        if not self.is_configured:
            logger.info(f"[TELEGRAM MOCK - File {file_path.name}]\nCaption: {caption}")
            return True

        url = f"{self.base_url}/sendDocument"
        overall_success = True
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                for cid in self.get_chat_ids():
                    with open(file_path, "rb") as f:
                        files = {"document": (file_path.name, f)}
                        data = {
                            "chat_id": cid,
                            "caption": caption[:1024],
                            "parse_mode": "HTML"
                        }
                        res = await client.post(url, data=data, files=files)
                        if res.status_code == 200:
                            logger.info(f"Telegram document sent successfully to chat_id {cid}")
                        else:
                            logger.error(f"Telegram sendDocument error {res.status_code} for chat {cid}: {res.text}")
                            overall_success = False
        except Exception as e:
            logger.error(f"Failed to send document to Telegram: {e}")
            return False

        return overall_success

telegram_service = TelegramService()

