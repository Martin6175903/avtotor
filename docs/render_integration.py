"""Rebuild the one-page diagram: python docs/render_integration.py.

Requires reportlab and DejaVu Sans fonts; these are documentation-only tools.
Set RAG_DIAGRAM_FONT_DIR when DejaVu fonts are not in the standard Linux path.
"""

import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parent
FONT_DIR = Path(os.getenv("RAG_DIAGRAM_FONT_DIR", "/usr/share/fonts/truetype/dejavu"))
pdfmetrics.registerFont(TTFont("Doc", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DocBold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))

INK = colors.HexColor("#153047")
MUTED = colors.HexColor("#4D6271")
BLUE = colors.HexColor("#EAF2F8")
GREEN = colors.HexColor("#EAF5EF")
ORANGE = colors.HexColor("#FFF3E5")
LINE = colors.HexColor("#8297A6")

pdf = canvas.Canvas(str(ROOT / "integration.pdf"), pagesize=A4)
pdf.setTitle("Автотор - схема интеграции локального RAG")
pdf.setAuthor("Avtotor prototype")


def text(x, y, value, size=10, bold=False, color=INK):
    pdf.setFillColor(color)
    pdf.setFont("DocBold" if bold else "Doc", size)
    pdf.drawString(x, y, value)


def paragraph(x, top, width, value, size=9.1, leading=12):
    style = ParagraphStyle(
        "body", fontName="Doc", fontSize=size, leading=leading,
        textColor=INK, alignment=TA_LEFT,
    )
    item = Paragraph(value, style)
    _, height = item.wrap(width, 800)
    item.drawOn(pdf, x, top - height)
    return height


def box(x, top, width, height, title, body, fill=BLUE, body_size=9.1):
    pdf.setFillColor(fill)
    pdf.setStrokeColor(colors.HexColor("#CDD9E1"))
    pdf.roundRect(x, top - height, width, height, 6, fill=1, stroke=1)
    text(x + 10, top - 16, title, 10, bold=True)
    actual = paragraph(x + 10, top - 23, width - 20, body, size=body_size, leading=11.8)
    if actual > height - 25:
        raise ValueError(f"Text overflows box: {title}")


def arrow(x1, y1, x2, y2):
    from math import atan2, cos, sin, pi
    pdf.setStrokeColor(LINE)
    pdf.setFillColor(LINE)
    pdf.setLineWidth(1)
    pdf.line(x1, y1, x2, y2)
    angle = atan2(y2 - y1, x2 - x1)
    p = pdf.beginPath()
    p.moveTo(x2, y2)
    for delta in (-pi / 6, pi / 6):
        p.lineTo(x2 - 5 * cos(angle + delta), y2 - 5 * sin(angle + delta))
    p.close()
    pdf.drawPath(p, fill=1, stroke=0)


text(36, 803, "Автотор / локальный RAG", 21, bold=True)
text(36, 782, "Запрос, авторизация, поиск, модель и источники", 10, color=MUTED)
text(36, 756, "user: public   |   hr: public + hr   |   admin: public + admin", 9.5, bold=True)
text(36, 741, "Все документы синтетические. Даже public требует входа.", 9, color=MUTED)

steps = [
    ("01  Запрос из React", 'POST /api/ask: {"question": "Отпуск"}<br/>Vite proxy → POST /ask; cookie отправляет браузер.'),
    ("02  Сессия и серверная роль", "AuthService: rag_session → user_id → роль.<br/>Роль из тела, заголовков и query не даёт прав."),
    ("03  Авторизация документов", "DocumentStore.available_to(user).<br/>Только public + документы своей роли."),
    ("04  Поиск по разрешённым текстам", "Совпадение слов в заголовке и тексте.<br/>Сортировка: оценка по убыванию, затем ID."),
    ("05  Детерминированный mock", "Вход: вопрос + разрешённые id/title/text.<br/>Ответ: соединение текстов выбранных источников."),
    ("06  Ответ и источники", "200: answer + sources из того же контекста.<br/>UI показывает текст и внутренние ссылки."),
]
tops = [724, 658, 592, 526, 460, 394]
for i, ((title, body), top) in enumerate(zip(steps, tops)):
    box(36, top, 342, 50, title, body, GREEN if i in (2, 5) else BLUE)
    if i < len(steps) - 1:
        arrow(207, top - 50, 207, tops[i + 1])

side = [
    (724, "422", "Лишние поля или<br/>невалидный вопрос.", ORANGE),
    (658, "401", "Нет действующей<br/>серверной сессии.", ORANGE),
    (592, "Локальный корпус", "3 public + 2 hr + 1 admin<br/>JSON на сервере.", BLUE),
    (526, "Нет совпадений", "Недостаточно данных.<br/>sources: []; без модели.", GREEN),
    (460, "503", "ModelUnavailableError:<br/>без внутренних деталей.", ORANGE),
]
for top, title, body, fill in side:
    box(400, top, 159, 50, title, body, fill, body_size=8.4)
    if title == "Локальный корпус":
        arrow(400, top - 25, 378, top - 25)
    else:
        arrow(378, top - 25, 400, top - 25)

text(36, 320, "Прямое открытие источника: проверка повторяется", 10.5, bold=True)
box(36, 303, 151, 57, "Страница документа", "GET /api/documents/id<br/>Cookie текущей сессии.", BLUE, 8.7)
box(208, 303, 164, 57, "FastAPI + Store", "Сессия → пользователь.<br/>get_available(id, user).", GREEN, 8.7)
box(393, 303, 166, 57, "Результат", "200: текст; 401: нет сессии.<br/>404: закрыт или не найден.", BLUE, 8.3)
arrow(187, 274, 208, 274)
arrow(372, 274, 393, 274)

box(36, 224, 252, 130, "Граница mock", "Статические тестовые аккаунты.<br/>Шесть вымышленных документов.<br/>Поиск по словам, без векторной БД.<br/>Соединение текстов вместо LLM.<br/><br/>HTTP 503 подменяется только в E2E;<br/>исключение модели проверяет pytest.", BLUE, 9)
box(307, 224, 252, 130, "Для реальной интеграции", "IdP/SSO, общее хранилище сессий.<br/>Документы и фрагменты с ACL.<br/>Поиск с фильтрацией по правам.<br/>LLM-адаптер: лимиты и таймауты.<br/>Проверка цитат и prompt injection.<br/>HTTPS, аудит, мониторинг и CI.", GREEN, 9)

text(36, 73, "Инвариант: закрытые источники не попадают в документный контекст модели.", 9, bold=True)
text(36, 55, "Подробности и исходные Mermaid-схемы: docs/INTEGRATION.md", 8.8, color=MUTED)
text(36, 39, "Учебный прототип • GitHub: Martin6175903/avtotor", 8, color=MUTED)
pdf.showPage()
pdf.save()
