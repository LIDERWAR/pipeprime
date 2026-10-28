import asyncio
import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from server.config import settings
from server.services.telegram import telegram_service

async def main():
    print("=" * 50)
    print("PipePrime Telegram Notification Verification")
    print("=" * 50)
    print(f"BOT_TOKEN configured: {'YES' if settings.TELEGRAM_BOT_TOKEN else 'NO'}")
    print(f"CHAT_ID configured: {settings.TELEGRAM_CHAT_ID or 'NONE'}")
    
    if not telegram_service.is_configured:
        print("\n[!] ОШИБКА: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заполнены в .env файле.")
        print("Пожалуйста, укажите их в server/.env и повторите попытку.")
        return

    chat_ids = telegram_service.get_chat_ids()
    print(f"\nПолучатели сообщений ({len(chat_ids)}): {', '.join(chat_ids)}")
    print("\nОтправка тестового сообщения...")

    test_message = (
        "🚀 <b>ТЕСТ СИСТЕМЫ УВЕДОМЛЕНИЙ PIPEPRIME</b>\n\n"
        "Бот успешно подключен к платформе <b>PipePrime.ru</b>!\n"
        "Все входящие спецификации, расчеты смет и заявки на трубы PE-RT II / ППУ "
        "будут мгновенно поступать в этот чат.\n\n"
        "<i>Статус: Система готова к приему клиентов.</i>"
    )

    success = await telegram_service.send_message(test_message)
    if success:
        print("\n[OK] УСПЕХ: Тестовое сообщение доставлено в Telegram!")
    else:
        print("\n[ERROR] ОШИБКА: Не удалось доставить сообщение.")

if __name__ == "__main__":
    asyncio.run(main())
