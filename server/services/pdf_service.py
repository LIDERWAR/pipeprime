import io
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from server.models import PdfCalcRequest

# Register Cyrillic-capable fonts
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

def setup_fonts():
    global FONT_REGULAR, FONT_BOLD
    # Try Windows system fonts
    win_arial = Path("C:/Windows/Fonts/arial.ttf")
    win_arial_bd = Path("C:/Windows/Fonts/arialbd.ttf")
    
    if win_arial.exists() and win_arial_bd.exists():
        try:
            pdfmetrics.registerFont(TTFont("Arial", str(win_arial)))
            pdfmetrics.registerFont(TTFont("Arial-Bold", str(win_arial_bd)))
            FONT_REGULAR = "Arial"
            FONT_BOLD = "Arial-Bold"
            return
        except Exception:
            pass

setup_fonts()

class PdfOfferGenerator:
    @staticmethod
    def generate_calculation_pdf(req: PdfCalcRequest) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom typography styles
        style_title = ParagraphStyle(
            'DocTitle',
            fontName=FONT_BOLD,
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )
        style_subtitle = ParagraphStyle(
            'DocSubtitle',
            fontName=FONT_REGULAR,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=15
        )
        style_brand = ParagraphStyle(
            'BrandName',
            fontName=FONT_BOLD,
            fontSize=14,
            leading=16,
            textColor=colors.HexColor('#ff6b00')
        )
        style_brand_sub = ParagraphStyle(
            'BrandSub',
            fontName=FONT_REGULAR,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#475569')
        )
        style_section_title = ParagraphStyle(
            'SectionTitle',
            fontName=FONT_BOLD,
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#0f172a'),
            spaceBefore=10,
            spaceAfter=6
        )
        style_cell = ParagraphStyle(
            'CellText',
            fontName=FONT_REGULAR,
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#1e293b')
        )
        style_cell_bold = ParagraphStyle(
            'CellBold',
            fontName=FONT_BOLD,
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#0f172a')
        )
        style_cell_accent = ParagraphStyle(
            'CellAccent',
            fontName=FONT_BOLD,
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor('#ff6b00')
        )
        style_note = ParagraphStyle(
            'NoteText',
            fontName=FONT_REGULAR,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748b')
        )

        elements = []

        # 1. Header Banner
        header_table_data = [
            [
                Paragraph("<b>PIPEPRIME</b><br/><font size=7 color='#64748b'>ИНЖЕНЕРНЫЕ СЕТИ И ТРУБОПРОВОДЫ</font>", style_brand),
                Paragraph(
                    "<b>ООО «ПайпПрайм»</b> | Оптовые поставки PE-RT II и ППУ<br/>"
                    "Тел: +7 (495) 123-45-67 | Email: order@pipeprime.ru<br/>"
                    "Сайт: pipeprime.ru | Складской резерв 1 000+ тонн",
                    style_brand_sub
                )
            ]
        ]
        header_table = Table(header_table_data, colWidths=[200, 320])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(header_table)

        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#ff6b00'), spaceBefore=2, spaceAfter=14))

        # 2. Document Title & Registration
        doc_date = datetime.now().strftime("%d.%m.%Y")
        doc_num = f"КП-{datetime.now().strftime('%y%m%d')}-{int(datetime.now().timestamp()) % 1000:03d}"
        
        elements.append(Paragraph("ТЕХНИКО-КОММЕРЧЕСКИЙ РАСЧЕТ И СПЕЦИФИКАЦИЯ", style_title))
        elements.append(Paragraph(f"Документ № {doc_num} от {doc_date} г. | Действителен в течение 14 дней", style_subtitle))

        # 3. Client & Project Info Block
        client_name = req.client_name or "Уважаемый заказчик"
        company_name = req.company or "Проектная / Монтажная организация"
        phone = req.phone or "—"
        email = req.email or "—"

        info_data = [
            [
                Paragraph("<b>Заказчик:</b>", style_cell),
                Paragraph(company_name, style_cell_bold),
                Paragraph("<b>Контактное лицо:</b>", style_cell),
                Paragraph(client_name, style_cell)
            ],
            [
                Paragraph("<b>Телефон:</b>", style_cell),
                Paragraph(phone, style_cell),
                Paragraph("<b>E-mail:</b>", style_cell),
                Paragraph(email, style_cell)
            ],
            [
                Paragraph("<b>Стандарт производства:</b>", style_cell),
                Paragraph("ГОСТ 32415-2013 / ГОСТ Р 56730-2015", style_cell),
                Paragraph("<b>Альбом решений:</b>", style_cell),
                Paragraph("АТР 2026 (Boilerberg / PipePrime)", style_cell)
            ]
        ]
        info_table = Table(info_data, colWidths=[120, 140, 110, 150])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 14))

        # 4. Specification Table
        elements.append(Paragraph("1. Ведомость материалов и расчет параметров трассы", style_section_title))

        whips = req.whips_12m or int((req.length_meters + 11.99) // 12)
        joints = req.joints_count or max(0, whips - 1)
        weight_t = req.weight_tons or round(req.length_meters * 0.005, 3)
        trucks = req.trucks_count or max(1, int((weight_t / 18.0) + 0.99))

        spec_data = [
            [
                Paragraph("<b>№</b>", style_cell_bold),
                Paragraph("<b>Наименование позиции</b>", style_cell_bold),
                Paragraph("<b>Параметры</b>", style_cell_bold),
                Paragraph("<b>Кол-во</b>", style_cell_bold),
                Paragraph("<b>Ед. изм.</b>", style_cell_bold)
            ],
            [
                Paragraph("1", style_cell),
                Paragraph(f"{req.pipe_category}", style_cell_bold),
                Paragraph(f"{req.diameter}, {req.sdr}, хлысты L=12 м", style_cell),
                Paragraph(f"{req.length_meters:,.0f}".replace(",", " "), style_cell_accent),
                Paragraph("м.п.", style_cell)
            ],
            [
                Paragraph("2", style_cell),
                Paragraph("Комплекты заделки стыков (КЗС) термоусаживаемые", style_cell),
                Paragraph(f"Под диаметр оболочки {req.diameter}", style_cell),
                Paragraph(str(joints), style_cell_accent),
                Paragraph("компл.", style_cell)
            ],
            [
                Paragraph("3", style_cell),
                Paragraph("Торцевые термоусадочные заглушки изоляции (ТЗ)", style_cell),
                Paragraph("Герметизация выхода из ППУ", style_cell),
                Paragraph("2", style_cell_accent),
                Paragraph("шт.", style_cell)
            ]
        ]

        spec_table = Table(spec_data, colWidths=[24, 230, 160, 60, 46])
        spec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (3, 0), (4, -1), 'RIGHT'),
        ]))
        elements.append(spec_table)
        elements.append(Spacer(1, 14))

        # 5. Logistics & Engineering Parameters Table
        elements.append(Paragraph("2. Логистические и весовые характеристики поставки", style_section_title))

        logistics_data = [
            [
                Paragraph("<b>Общий расчетный вес партии:</b>", style_cell),
                Paragraph(f"<b>{weight_t:.2f} тонн</b>", style_cell_accent),
                Paragraph("<b>Количество хлыстов (12 м):</b>", style_cell),
                Paragraph(f"<b>{whips} хлыстов</b>", style_cell_bold)
            ],
            [
                Paragraph("<b>Требуемый транспорт:</b>", style_cell),
                Paragraph(f"<b>{trucks} еврофура(ы)</b> (13.6 м, до 20 т)", style_cell_bold),
                Paragraph("<b>Режим термостойкости:</b>", style_cell),
                Paragraph("до +95°C (авар. до +110°C)", style_cell)
            ]
        ]
        log_table = Table(logistics_data, colWidths=[150, 120, 150, 100])
        log_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(log_table)
        elements.append(Spacer(1, 14))

        # 6. Technical Notes & Conditions
        elements.append(Paragraph("3. Условия поставки и гарантийные обязательства", style_section_title))
        notes = (
            "• Продукция сертифицирована в соответствии с ГОСТ 32415-2013 и ГОСТ Р 56730-2015.<br/>"
            "• Трубы PE-RT тип II не подвержены электрохимической коррозии и зарастанию отложениями. Срок службы: более 50 лет.<br/>"
            "• Отгрузка осуществляется со складов PipePrime (Москва, Санкт-Петербург, Казань, Екатеринбург).<br/>"
            "• Для аккредитованных проектных и монтажных организаций доступна отсрочка платежа до 60 дней и факторинг."
        )
        elements.append(Paragraph(notes, style_note))
        elements.append(Spacer(1, 25))

        # 7. Signature & Stamp Block
        sig_data = [
            [
                Paragraph("<b>Руководитель направления поставок:</b><br/><br/>__________________ / Смирнов А. В.", style_cell),
                Paragraph("<b>Инженер проектного отдела:</b><br/><br/>__________________ / Кузнецов Д. И.", style_cell),
                Paragraph("<b>М.П.</b><br/><br/><font color='#ff6b00'>[ PipePrime Engineering ]</font>", style_cell_accent)
            ]
        ]
        sig_table = Table(sig_data, colWidths=[180, 180, 160])
        sig_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ]))
        elements.append(sig_table)

        # Build document
        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_generator = PdfOfferGenerator()
