import asyncio
import logging
import smtplib
import ssl
from email.header import Header
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional, Union
from server.config import settings

logger = logging.getLogger("pipeprime.email")

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from = settings.SMTP_FROM or "noreply@pipeprime.ru"
        self.admin_email = settings.ADMIN_EMAIL or "info@pipeprime.ru"

    @property
    def is_configured(self) -> bool:
        return bool(self.smtp_server and self.admin_email)

    def _send_sync(
        self,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachment_path: Optional[Union[str, Path]] = None,
        attachment_filename: Optional[str] = None,
    ) -> bool:
        if not self.is_configured:
            logger.info(
                f"[EMAIL MOCK - SMTP not configured]\n"
                f"To: {self.admin_email}\n"
                f"Subject: {subject}\n"
                f"Body preview:\n{text_content or html_content[:300]}"
            )
            return True

        msg = MIMEMultipart("mixed")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = self.smtp_from
        msg["To"] = self.admin_email

        alt_part = MIMEMultipart("alternative")
        if text_content:
            alt_part.attach(MIMEText(text_content, "plain", "utf-8"))
        alt_part.attach(MIMEText(html_content, "html", "utf-8"))
        msg.attach(alt_part)

        if attachment_path:
            att_path = Path(attachment_path)
            if att_path.exists() and att_path.is_file():
                try:
                    with open(att_path, "rb") as f:
                        part = MIMEApplication(f.read(), Name=attachment_filename or att_path.name)
                    part["Content-Disposition"] = f'attachment; filename="{attachment_filename or att_path.name}"'
                    msg.attach(part)
                except Exception as e:
                    logger.error(f"Failed to attach file {attachment_path}: {e}")

        try:
            if self.smtp_port == 465:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context, timeout=15.0) as server:
                    if self.smtp_user and self.smtp_password:
                        server.login(self.smtp_user, self.smtp_password)
                    server.sendmail(self.smtp_from, [self.admin_email], msg.as_string())
            else:
                with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=15.0) as server:
                    try:
                        server.ehlo()
                        context = ssl.create_default_context()
                        server.starttls(context=context)
                        server.ehlo()
                    except Exception as tls_err:
                        logger.warning(f"STARTTLS skipped or unsupported by SMTP server: {tls_err}")
                    if self.smtp_user and self.smtp_password:
                        server.login(self.smtp_user, self.smtp_password)
                    server.sendmail(self.smtp_from, [self.admin_email], msg.as_string())

            logger.info(f"Email successfully sent to {self.admin_email} (Subject: {subject})")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP ({self.smtp_server}:{self.smtp_port}): {e}")
            return False

    async def send_lead_email(
        self,
        subject: str,
        lead_type_title: str,
        order_number: str,
        fields: list[tuple[str, str]],
        items: Optional[list[dict]] = None,
        attachment_path: Optional[Union[str, Path]] = None,
        attachment_filename: Optional[str] = None
    ) -> bool:
        """Asynchronously send lead notification email without blocking FastAPI."""
        rows_html = "".join(
            f'<tr><td style="padding: 8px 12px; border-bottom: 1px solid #2d3748; color: #a0aec0; width: 180px;"><b>{label}:</b></td>'
            f'<td style="padding: 8px 12px; border-bottom: 1px solid #2d3748; color: #ffffff;">{value}</td></tr>'
            for label, value in fields
        )

        items_html = ""
        if items:
            items_rows = "".join(
                f'<tr><td style="padding: 6px 10px; border-bottom: 1px solid #2d3748; color: #e2e8f0;">{idx}. {itm.get("display_name", "")}</td>'
                f'<td style="padding: 6px 10px; border-bottom: 1px solid #2d3748; text-align: center; color: #ff6b00; font-weight: bold;">{itm.get("display_qty", "")} шт.</td>'
                f'<td style="padding: 6px 10px; border-bottom: 1px solid #2d3748; color: #a0aec0;">{itm.get("article", "—")}</td></tr>'
                for idx, itm in enumerate(items, start=1)
            )
            items_html = f"""
            <h3 style="color: #ff6b00; margin-top: 24px; margin-bottom: 12px; font-family: sans-serif;">Состав спецификации:</h3>
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; background: #1a202c; border-radius: 6px;">
                <thead>
                    <tr style="background: #2d3748; color: #cbd5e0;">
                        <th style="padding: 8px 10px; text-align: left;">Наименование</th>
                        <th style="padding: 8px 10px; text-align: center;">Кол-во</th>
                        <th style="padding: 8px 10px; text-align: left;">Артикул</th>
                    </tr>
                </thead>
                <tbody>
                    {items_rows}
                </tbody>
            </table>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 20px; background-color: #0c0f14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 640px; margin: 0 auto; background: #121721; border: 1px solid #2d3748; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #ff8833 0%, #ff6b00 100%); padding: 18px 24px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px;">PipePrime — {lead_type_title}</h2>
                    <div style="color: #fff; opacity: 0.9; font-size: 13px; margin-top: 4px;">Номер заявки: <b>{order_number}</b></div>
                </div>
                <div style="padding: 24px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tbody>
                            {rows_html}
                        </tbody>
                    </table>
                    {items_html}
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #2d3748; font-size: 12px; color: #718096; text-align: center;">
                        Автоматическое уведомление инженерного отдела PipePrime • pipeprime.ru
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        text_lines = [f"PipePrime — {lead_type_title} ({order_number})\n"]
        for label, val in fields:
            text_lines.append(f"{label}: {val}")
        if items:
            text_lines.append("\nСостав спецификации:")
            for idx, itm in enumerate(items, start=1):
                text_lines.append(f"{idx}. {itm.get('display_name')} | {itm.get('display_qty')} шт. (Арт: {itm.get('article', '—')})")

        text_content = "\n".join(text_lines)

        return await asyncio.to_thread(
            self._send_sync,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            attachment_path=attachment_path,
            attachment_filename=attachment_filename
        )

email_service = EmailService()
