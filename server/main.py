import uuid
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server.config import settings, PROJECT_ROOT
from server.database import init_db, create_lead
from server.models import (
    SpecificationLeadRequest,
    CallbackLeadRequest,
    ATRRequest,
    LeadResponse,
    ATRResponse,
    PdfCalcRequest
)
from server.services.telegram import telegram_service
from server.services.atr_service import atr_service
from server.services.pdf_service import pdf_generator

app = FastAPI(
    title="PipePrime B2B Enterprise API",
    description="Официальный серверный API платформы PipePrime: поставки полимерных систем PE-RT II и ППУ",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Initialize SQLite database and directory structures on server start."""
    init_db()

@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify server status."""
    return {
        "status": "healthy",
        "service": "PipePrime API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# --- 1. Specification Orders from Cart Drawer ---
@app.post("/api/leads/specification", response_model=LeadResponse, tags=["Leads"])
async def create_specification_lead(payload: SpecificationLeadRequest):
    """
    Прием заказной спецификации из корзины PipePrime.
    Сохраняет заказ в БД и отправляет карточку лида в Telegram.
    """
    items_dicts = [item.model_dump() for item in payload.items]
    lead = create_lead(
        lead_type="specification",
        client_name=payload.name,
        phone=payload.phone,
        email=payload.email,
        company=payload.company,
        inn=payload.inn,
        delivery_address=payload.delivery_address,
        comment=payload.comment,
        items=items_dicts,
        total_weight_kg=payload.total_weight_kg or 0.0
    )

    # Format Telegram Notification
    tg_lines = [
        f"📋 <b>НОВАЯ ЗАКАЗНАЯ СПЕЦИФИКАЦИЯ</b> (<code>{lead['order_number']}</code>)\n",
        f"<b>Клиент:</b> {payload.name}",
        f"<b>Телефон:</b> {payload.phone}",
        f"<b>Email:</b> {payload.email or 'не указан'}",
        f"<b>Компания:</b> {payload.company or 'не указана'} (ИНН: {payload.inn or '—'})",
        f"<b>Адрес доставки:</b> {payload.delivery_address or 'Самовывоз / Уточнить'}",
        f"<b>Комментарий:</b> {payload.comment or '—'}\n",
        f"<b>Общий вес:</b> {payload.total_weight_kg:.1f} кг ({(payload.total_weight_kg/1000):.2f} т)"
    ]

    if payload.items:
        tg_lines.append("\n<b>Состав спецификации:</b>")
        for idx, itm in enumerate(payload.items, start=1):
            tg_lines.append(f"{idx}. <b>{itm.display_name}</b> | {itm.display_qty} шт./хлыст (Арт: {itm.article or '—'})")

    await telegram_service.send_message("\n".join(tg_lines))

    return LeadResponse(
        order_number=lead["order_number"],
        message="Спецификация успешно принята в обработку. Номер вашего заказа: " + lead["order_number"],
        data={"order_number": lead["order_number"]}
    )

# --- 2. Project Blueprints & Estimates Upload ---
ALLOWED_UPLOAD_EXTS = {".pdf", ".dwg", ".dxf", ".xls", ".xlsx", ".doc", ".docx", ".zip", ".rar", ".7z"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

@app.post("/api/leads/estimate", response_model=LeadResponse, tags=["Leads"])
async def upload_estimate_file(
    name: str = Form(...),
    phone: str = Form(...),
    email: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    inn: Optional[str] = Form(None),
    comment: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Загрузка проектной сметы или чертежа (PDF, DWG, XLSX, ZIP).
    Сохраняет файл на сервере и пересылает инженерам.
    """
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый формат файла {ext}. Разрешены: PDF, DWG, DXF, XLSX, ZIP, RAR."
        )

    # Clean filename
    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', Path(file.filename or "estimate").name)
    stored_name = f"{uuid.uuid4().hex[:8]}_{safe_name}"
    target_path = settings.UPLOADS_DIR / stored_name

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Размер файла превышает лимит 50 МБ."
        )

    with open(target_path, "wb") as f:
        f.write(contents)

    lead = create_lead(
        lead_type="estimate",
        client_name=name,
        phone=phone,
        email=email,
        company=company,
        inn=inn,
        comment=comment,
        file_path=str(target_path)
    )

    caption = (
        f"📎 <b>ПРОЕКТНАЯ СМЕТА НА РАСЧЕТ</b> (<code>{lead['order_number']}</code>)\n"
        f"<b>Заказчик:</b> {name} | {phone}\n"
        f"<b>Компания:</b> {company or '—'} (ИНН: {inn or '—'})\n"
        f"<b>Email:</b> {email or '—'}\n"
        f"<b>Файл:</b> {file.filename} ({(len(contents)/1024/1024):.2f} МБ)\n"
        f"<b>Комментарий:</b> {comment or '—'}"
    )

    await telegram_service.send_document(target_path, caption)

    return LeadResponse(
        order_number=lead["order_number"],
        message=f"Файл «{file.filename}» успешно передан в инженерный отдел. Номер заявки: {lead['order_number']}",
        data={"order_number": lead["order_number"], "filename": file.filename}
    )

# --- 3. Quick Callbacks & Inquiries ---
@app.post("/api/leads/callback", response_model=LeadResponse, tags=["Leads"])
async def request_callback(payload: CallbackLeadRequest):
    """
    Заказ обратного звонка или экспресс-консультации технического специалиста.
    """
    lead = create_lead(
        lead_type="callback",
        client_name=payload.name,
        phone=payload.phone,
        comment=payload.comment or payload.topic
    )

    tg_text = (
        f"📞 <b>ЗАПРОС ОБРАТНОГО ЗВОНКА</b> (<code>{lead['order_number']}</code>)\n\n"
        f"<b>Имя:</b> {payload.name}\n"
        f"<b>Телефон:</b> {payload.phone}\n"
        f"<b>Тема:</b> {payload.topic or 'Консультация инженера'}\n"
        f"<b>Комментарий:</b> {payload.comment or '—'}"
    )
    await telegram_service.send_message(tg_text)

    return LeadResponse(
        order_number=lead["order_number"],
        message="Заявка принята. Дежурный инженер PipePrime свяжется с вами в течение 15 минут.",
        data={"order_number": lead["order_number"]}
    )

# --- 4. Protected ATR 2026 Access ---
@app.post("/api/atr/request", response_model=ATRResponse, tags=["ATR 2026 IP Protection"])
async def request_atr_access(payload: ATRRequest):
    """
    Запрос доступа к Альбому технических решений (АТР 2026).
    Требует валидации ИНН и юридических данных компании. Выдает временный токен скачивания.
    """
    lead = create_lead(
        lead_type="atr_request",
        client_name=payload.name,
        phone=payload.phone,
        email=payload.email,
        company=payload.company,
        inn=payload.inn,
        comment=f"Цель: {payload.purpose}"
    )

    token, expires_at = atr_service.create_access_token(
        lead_id=lead["id"],
        email=payload.email,
        company=payload.company,
        inn=payload.inn
    )

    download_url = f"/api/atr/download/{token}"

    tg_text = (
        f"🔐 <b>ЗАПРОС ДОСТУПА К АТР 2026</b> (<code>{lead['order_number']}</code>)\n\n"
        f"<b>Инженер:</b> {payload.name}\n"
        f"<b>Организация:</b> {payload.company} (ИНН: <code>{payload.inn}</code>)\n"
        f"<b>Телефон:</b> {payload.phone}\n"
        f"<b>Email:</b> {payload.email}\n"
        f"<b>Цель:</b> {payload.purpose or 'Проектирование'}\n\n"
        f"<i>Сгенерирован временный токен доступа (24ч):</i> <code>{token[:12]}...</code>"
    )
    await telegram_service.send_message(tg_text)

    return ATRResponse(
        order_number=lead["order_number"],
        download_url=download_url,
        expires_in_hours=settings.ATR_TOKEN_EXPIRE_HOURS,
        message=f"Доступ к АТР 2026 подтвержден для компании {payload.company}. Файл доступен для скачивания."
    )

@app.get("/api/atr/download/{token}", tags=["ATR 2026 IP Protection"])
async def download_atr_protected(token: str):
    """
    Защищенная отдача АТР 2026 по валидному одноразовому/временному токену.
    Прямой доступ к файлу без токена заблокирован.
    """
    file_path = atr_service.verify_and_claim_token(token)
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Срок действия ссылки истек или токен недействителен. Оформите корпоративный запрос повторно."
        )

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename="PipePrime_Boilerberg_ATR_2026.pdf",
        headers={
            "X-Robots-Tag": "noindex, nofollow, noarchive",
            "Cache-Control": "private, no-cache, no-store, must-revalidate"
        }
    )

# --- 5. Commercial Offer PDF Generator ---
@app.post("/api/calculator/generate-pdf", tags=["Calculator & Quotes"])
async def export_calculation_pdf(req: PdfCalcRequest):
    """
    Генерация официального фирменного коммерческого предложения / спецификации в формате PDF.
    """
    try:
        pdf_buffer = pdf_generator.generate_calculation_pdf(req)
        date_str = datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"PipePrime_KP_{date_str}.pdf"

        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка формирования PDF документа: {str(e)}"
        )

# --- Mount Static Website Files (Securely) ---
# Allows running the full platform (UI + Backend) on a single port or inside Docker
assets_dir = PROJECT_ROOT / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

HTML_PAGES = {
    "index": PROJECT_ROOT / "index.html",
    "catalog": PROJECT_ROOT / "catalog.html",
    "catalog-uninsulated-bars": PROJECT_ROOT / "catalog-uninsulated-bars.html",
    "catalog-uninsulated-coils": PROJECT_ROOT / "catalog-uninsulated-coils.html",
    "catalog-insulated-ppu-pe": PROJECT_ROOT / "catalog-insulated-ppu-pe.html",
    "catalog-insulated-ppu-oc": PROJECT_ROOT / "catalog-insulated-ppu-oc.html",
    "catalog-insulated-flexible": PROJECT_ROOT / "catalog-insulated-flexible.html",
    "catalog-fittings-electro": PROJECT_ROOT / "catalog-fittings-electro.html",
    "catalog-fittings-spigot": PROJECT_ROOT / "catalog-fittings-spigot.html",
    "catalog-fittings-rastrub": PROJECT_ROOT / "catalog-fittings-rastrub.html",
    "catalog-fittings-ppu": PROJECT_ROOT / "catalog-fittings-ppu.html",
    "catalog-accessories-kzs": PROJECT_ROOT / "catalog-accessories-kzs.html",
    "calculator": PROJECT_ROOT / "calculator.html",
    "engineering": PROJECT_ROOT / "engineering.html",
    "solutions-steel-connection": PROJECT_ROOT / "solutions-steel-connection.html",
    "solutions-fixed-anchors": PROJECT_ROOT / "solutions-fixed-anchors.html",
    "solutions-heat-chambers": PROJECT_ROOT / "solutions-heat-chambers.html",
    "solutions-aboveground-racks": PROJECT_ROOT / "solutions-aboveground-racks.html",
    "solutions-casing-trenchless": PROJECT_ROOT / "solutions-casing-trenchless.html",
    "solutions-snow-melting": PROJECT_ROOT / "solutions-snow-melting.html",
    "about": PROJECT_ROOT / "about.html",
    "delivery": PROJECT_ROOT / "delivery.html",
    "contacts": PROJECT_ROOT / "contacts.html",
}

@app.get("/", tags=["Pages"])
async def serve_index():
    index_file = PROJECT_ROOT / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "PipePrime API is running"}

@app.get("/{page_name:path}", tags=["Pages"])
async def serve_page(page_name: str):
    clean_name = page_name[:-5] if page_name.endswith(".html") else page_name
    if clean_name in HTML_PAGES and HTML_PAGES[clean_name].exists():
        return FileResponse(HTML_PAGES[clean_name])

    # Dynamic check for any HTML page in project root
    direct_html = PROJECT_ROOT / f"{clean_name}.html"
    if direct_html.exists():
        return FileResponse(direct_html)

    # Allow SEO, manifest and icon root assets
    if page_name in {"robots.txt", "sitemap.xml", "favicon.ico", "site.webmanifest"}:
        target = PROJECT_ROOT / page_name
        if target.exists():
            return FileResponse(target)

    raise HTTPException(status_code=404, detail="Страница не найдена")

