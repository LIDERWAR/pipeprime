import logging
import re
from pathlib import Path
from typing import Optional, List, Dict, Any, Union
import httpx
from server.config import settings

logger = logging.getLogger("pipeprime.telegram")

class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.api_base = settings.TELEGRAM_API_BASE
        self.base_url = f"{self.api_base}/bot{self.bot_token}"

    @property
    def is_configured(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    def get_chat_ids(self) -> List[str]:
        if not self.chat_id:
            return []
        return [cid.strip() for cid in str(self.chat_id).split(",") if cid.strip()]

    @staticmethod
    def clean_phone_digits(phone: Optional[str]) -> str:
        """Strip non-digit characters and normalize Russian numbers to 79XXXXXXXXX."""
        if not phone:
            return ""
        digits = re.sub(r"\D", "", phone)
        if len(digits) == 11 and digits.startswith("8"):
            digits = "7" + digits[1:]
        elif len(digits) == 10:
            digits = "7" + digits
        return digits

    def build_lead_inline_keyboard(self, order_number: str, phone: Optional[str] = None) -> Dict[str, Any]:
        """Generate action buttons for new leads."""
        buttons = [
            [{"text": "🟢 Взять в работу", "callback_data": f"take_{order_number}"}]
        ]
        
        contact_row = []
        clean_digits = self.clean_phone_digits(phone)
        if clean_digits:
            contact_row.append({"text": "📞 Позвонить", "url": f"tel:+{clean_digits}"})
            contact_row.append({"text": "💬 WhatsApp", "url": f"https://wa.me/{clean_digits}"})
        
        if contact_row:
            buttons.append(contact_row)

        return {"inline_keyboard": buttons}

    def build_taken_inline_keyboard(self, order_number: str, phone: Optional[str] = None, manager_name: str = "Менеджер") -> Dict[str, Any]:
        """Generate action buttons when lead is taken into progress."""
        buttons = [
            [{"text": f"👤 В работе: {manager_name}", "callback_data": f"info_{order_number}"}]
        ]
        
        contact_row = []
        clean_digits = self.clean_phone_digits(phone)
        if clean_digits:
            contact_row.append({"text": "📞 Позвонить", "url": f"tel:+{clean_digits}"})
            contact_row.append({"text": "💬 WhatsApp", "url": f"https://wa.me/{clean_digits}"})
        
        if contact_row:
            buttons.append(contact_row)

        buttons.append([{"text": "🏁 Завершить заказ", "callback_data": f"done_{order_number}"}])

        return {"inline_keyboard": buttons}

    def build_done_inline_keyboard(self, order_number: str) -> Dict[str, Any]:
        """Generate static status badge when lead is completed."""
        return {
            "inline_keyboard": [
                [{"text": f"✅ Заказ {order_number} выполнен", "callback_data": f"info_{order_number}"}]
            ]
        }

    def build_main_reply_keyboard(self) -> Dict[str, Any]:
        """Persistent bottom menu for PipePrime managers."""
        return {
            "keyboard": [
                [{"text": "📋 Свежие заявки"}, {"text": "📊 Статистика за сегодня"}],
                [{"text": "🆔 Мой Telegram ID"}, {"text": "❓ Справка"}]
            ],
            "resize_keyboard": True,
            "is_persistent": True
        }

    async def send_message(
        self,
        text: str,
        reply_markup: Optional[Dict[str, Any]] = None,
        target_chat_id: Optional[Union[str, int]] = None
    ) -> bool:
        """Send formatted HTML message to Telegram."""
        if not self.bot_token:
            logger.info("[TELEGRAM MOCK - No token]\n" + text)
            return True

        url = f"{self.base_url}/sendMessage"
        recipients = [str(target_chat_id)] if target_chat_id else self.get_chat_ids()
        if not recipients:
            logger.warning("No Telegram recipients configured")
            return False

        overall_success = True
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                for cid in recipients:
                    payload = {
                        "chat_id": cid,
                        "text": text,
                        "parse_mode": "HTML",
                        "disable_web_page_preview": True
                    }
                    if reply_markup:
                        payload["reply_markup"] = reply_markup

                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        logger.info(f"Telegram message sent to {cid}")
                    else:
                        logger.error(f"Telegram error {res.status_code} for {cid}: {res.text}")
                        overall_success = False
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

        return overall_success

    async def send_document(
        self,
        file_path: Path,
        caption: str,
        reply_markup: Optional[Dict[str, Any]] = None,
        target_chat_id: Optional[Union[str, int]] = None
    ) -> bool:
        """Send attached file with optional inline buttons."""
        if not self.bot_token:
            logger.info(f"[TELEGRAM MOCK - File {file_path.name}]\nCaption: {caption}")
            return True

        url = f"{self.base_url}/sendDocument"
        recipients = [str(target_chat_id)] if target_chat_id else self.get_chat_ids()
        if not recipients:
            return False

        overall_success = True
        try:
            import json
            async with httpx.AsyncClient(timeout=30.0) as client:
                for cid in recipients:
                    with open(file_path, "rb") as f:
                        files = {"document": (file_path.name, f)}
                        data = {
                            "chat_id": cid,
                            "caption": caption[:1024],
                            "parse_mode": "HTML"
                        }
                        if reply_markup:
                            data["reply_markup"] = json.dumps(reply_markup)

                        res = await client.post(url, data=data, files=files)
                        if res.status_code == 200:
                            logger.info(f"Telegram document sent to {cid}")
                        else:
                            logger.error(f"Telegram sendDocument error {res.status_code} for {cid}: {res.text}")
                            overall_success = False
        except Exception as e:
            logger.error(f"Failed to send document to Telegram: {e}")
            return False

        return overall_success

    async def answer_callback_query(self, callback_query_id: str, text: Optional[str] = None, show_alert: bool = False) -> bool:
        """Acknowledge button click in Telegram."""
        if not self.bot_token:
            return True
        url = f"{self.base_url}/answerCallbackQuery"
        payload = {"callback_query_id": callback_query_id, "show_alert": show_alert}
        if text:
            payload["text"] = text
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Failed to answer callback query: {e}")
            return False

    async def edit_message_reply_markup(
        self,
        chat_id: Union[str, int],
        message_id: int,
        reply_markup: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update inline buttons on an existing message."""
        if not self.bot_token:
            return True
        url = f"{self.base_url}/editMessageReplyMarkup"
        payload = {
            "chat_id": chat_id,
            "message_id": message_id,
            "reply_markup": reply_markup or {"inline_keyboard": []}
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Failed to edit message reply markup: {e}")
            return False

    async def edit_message_text(
        self,
        chat_id: Union[str, int],
        message_id: int,
        text: str,
        reply_markup: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Edit text and markup of an existing message."""
        if not self.bot_token:
            return True
        url = f"{self.base_url}/editMessageText"
        payload = {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Failed to edit message text: {e}")
            return False

    async def set_bot_commands(self) -> bool:
        """Register bot commands in Telegram UI menu."""
        if not self.bot_token:
            return True
        url = f"{self.base_url}/setMyCommands"
        commands = [
            {"command": "start", "description": "Главное меню и ваш Telegram ID"},
            {"command": "leads", "description": "Свежие входящие заявки"},
            {"command": "stats", "description": "Статистика поставок за сегодня"},
            {"command": "id", "description": "Узнать свой Telegram ID"}
        ]
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json={"commands": commands})
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Failed to set bot commands: {e}")
            return False

telegram_service = TelegramService()
