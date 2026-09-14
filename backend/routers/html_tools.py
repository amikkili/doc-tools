import io
from fastapi import APIRouter, Form, HTTPException
from .utils import safe_error
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.post("/to-pdf")
async def html_to_pdf(url: str = Form(None), html: str = Form(None)):
    if not url and not html:
        raise HTTPException(400, "Provide either a URL or HTML content")
    try:
        if url:
            pdf_bytes = _url_to_pdf(url)
        else:
            pdf_bytes = _html_to_pdf(html)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="page.pdf"'},
        )
    except Exception as e:
        raise HTTPException(500, safe_error(e))


def _url_to_pdf(url: str) -> bytes:
    """Try playwright first, fall back to weasyprint with requests."""
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            pdf = page.pdf(format="A4")
            browser.close()
            return pdf
    except Exception:
        pass

    import requests
    resp = requests.get(url, timeout=30, headers={"User-Agent": "DocCraft/1.0"})
    resp.raise_for_status()
    return _html_to_pdf(resp.text)


def _html_to_pdf(html: str) -> bytes:
    """WeasyPrint HTML → PDF."""
    try:
        from weasyprint import HTML
        return HTML(string=html).write_pdf()
    except Exception:
        pass

    # Last resort: reportlab with plain text
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet
    import re

    clean = re.sub(r"<[^>]+>", " ", html)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    doc.build([Paragraph(clean[:5000], styles["Normal"])])
    return buf.getvalue()
