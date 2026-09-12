import io
import os
import sys
import tempfile
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from .utils import check_size

router = APIRouter()


@router.post("/to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    try:
        data = await file.read()
        check_size(data)
        pdf_bytes = _docx_to_pdf(data, file.filename or "input.docx")
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="converted.pdf"'},
        )
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Conversion chain ──────────────────────────────────────────────────────
# Priority:
#   1. docx2pdf  — Windows only, uses MS Word COM; best quality, handles CJK/Telugu/Arabic
#   2. LibreOffice — Linux/macOS/Docker; high quality, needs soffice in PATH
#   3. ReportLab  — pure Python last resort; Latin fonts only, no complex scripts

def _docx_to_pdf(data: bytes, filename: str) -> bytes:
    # 1. Try docx2pdf (MS Word on Windows)
    if sys.platform == "win32":
        try:
            return _docx2pdf_convert(data, filename)
        except Exception:
            pass  # fall through to LibreOffice or ReportLab

    # 2. Try LibreOffice
    import shutil
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if soffice:
        try:
            return _soffice_convert(soffice, data, filename)
        except Exception:
            pass  # fall through

    # 3. ReportLab plain-text fallback (Latin only)
    return _reportlab_convert(data)


# ── Engine 1: docx2pdf (Windows + MS Word) ───────────────────────────────
# Run in a subprocess to avoid win32com COM threading issues inside FastAPI.

def _docx2pdf_convert(data: bytes, filename: str) -> bytes:
    import subprocess

    ext = ".docx" if filename.lower().endswith(".docx") else ".doc"
    with tempfile.TemporaryDirectory() as tmp:
        inp = os.path.join(tmp, f"input{ext}")
        out = os.path.join(tmp, "output.pdf")
        with open(inp, "wb") as f:
            f.write(data)

        result = subprocess.run(
            [
                sys.executable, "-c",
                f"from docx2pdf import convert; convert(r'{inp}', r'{out}')"
            ],
            capture_output=True,
            timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.decode())
        if not os.path.exists(out):
            raise RuntimeError("docx2pdf produced no output file")

        with open(out, "rb") as f:
            return f.read()


# ── Engine 2: LibreOffice headless ───────────────────────────────────────

def _soffice_convert(soffice: str, data: bytes, filename: str) -> bytes:
    import subprocess

    ext = ".docx" if filename.lower().endswith(".docx") else ".doc"
    with tempfile.TemporaryDirectory() as tmp:
        inp = os.path.join(tmp, f"input{ext}")
        with open(inp, "wb") as f:
            f.write(data)
        result = subprocess.run(
            [soffice, "--headless", "--convert-to", "pdf", "--outdir", tmp, inp],
            capture_output=True, timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.decode())
        pdf_path = inp.rsplit(".", 1)[0] + ".pdf"
        with open(pdf_path, "rb") as f:
            return f.read()


# ── Engine 3: ReportLab fallback (Latin fonts only) ──────────────────────

def _reportlab_convert(data: bytes) -> bytes:
    from docx import Document
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    # Try to register a Unicode font that covers Telugu + Latin
    # Common locations on Windows for Noto fonts or Arial Unicode
    unicode_font_registered = False
    font_candidates = [
        # Noto Sans Telugu (if user installed it)
        r"C:\Windows\Fonts\NotoSansTelugu-Regular.ttf",
        # Arial Unicode MS — ships with MS Office, covers Telugu
        r"C:\Windows\Fonts\ARIALUNI.TTF",
        # Calibri — ships with Windows, partial Telugu
        r"C:\Windows\Fonts\calibri.ttf",
    ]
    unicode_font_name = "Helvetica"  # default fallback
    for path in font_candidates:
        if os.path.exists(path):
            try:
                font_name = os.path.splitext(os.path.basename(path))[0]
                pdfmetrics.registerFont(TTFont(font_name, path))
                unicode_font_name = font_name
                unicode_font_registered = True
                break
            except Exception:
                continue

    doc = Document(io.BytesIO(data))
    styles = getSampleStyleSheet()

    normal_style = ParagraphStyle(
        "UniNormal",
        parent=styles["Normal"],
        fontName=unicode_font_name,
        fontSize=10,
        leading=14,
        spaceAfter=4,
        wordWrap="CJK",  # handles non-Latin scripts better
    )
    heading_style = ParagraphStyle(
        "UniHeading",
        parent=styles["Heading1"],
        fontName=unicode_font_name,
        fontSize=13,
        leading=18,
        spaceAfter=6,
        wordWrap="CJK",
    )

    buf = io.BytesIO()
    pdf = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )
    story = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            story.append(Spacer(1, 6))
            continue
        is_heading = para.style.name.startswith("Heading")
        style = heading_style if is_heading else normal_style
        # Escape XML special chars for ReportLab
        safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        try:
            story.append(Paragraph(safe, style))
        except Exception:
            # If even the Unicode font can't render, skip gracefully
            story.append(Paragraph("[content not renderable]", normal_style))

    pdf.build(story)
    return buf.getvalue()
