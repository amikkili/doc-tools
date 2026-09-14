import io
import re
from fastapi import APIRouter, File, HTTPException, UploadFile
from .utils import check_size, safe_error

router = APIRouter()

# ── Keyword vocabulary ─────────────────────────────────────────────────────

DOCUMENT_TYPES = {
    "invoice": {
        "label": "Invoice / Bill",
        "icon": "🧾",
        "keywords": {
            "invoice": 10, "bill to": 9, "ship to": 7, "amount due": 10,
            "payment due": 9, "subtotal": 8, "tax": 5, "total": 4,
            "purchase order": 9, "qty": 7, "quantity": 6, "unit price": 8,
            "receipt": 8, "remit": 7, "vendor": 6, "billing": 7,
        },
        "tools": [
            {"name": "PDF to Excel", "path": "/pdf-to-excel", "reason": "Extract invoice data into a spreadsheet"},
            {"name": "Compress PDF",  "path": "/compress-pdf",  "reason": "Reduce size before emailing"},
            {"name": "Protect PDF",   "path": "/protect-pdf",   "reason": "Password-protect financial documents"},
        ],
    },
    "resume": {
        "label": "Resume / CV",
        "icon": "👤",
        "keywords": {
            "resume": 10, "curriculum vitae": 10, "cv": 6, "work experience": 9,
            "education": 7, "skills": 6, "objective": 6, "summary": 4,
            "employment": 8, "references": 7, "achievements": 7, "certifications": 8,
            "linkedin": 9, "github": 8, "portfolio": 7,
        },
        "tools": [
            {"name": "PDF to Word", "path": "/pdf-to-word", "reason": "Edit your resume in Word"},
            {"name": "Compress PDF", "path": "/compress-pdf", "reason": "Reduce size for job applications"},
        ],
    },
    "legal": {
        "label": "Legal Contract",
        "icon": "⚖️",
        "keywords": {
            "agreement": 8, "contract": 9, "whereas": 10, "hereinafter": 10,
            "party": 6, "parties": 6, "jurisdiction": 9, "liability": 8,
            "indemnify": 10, "indemnification": 10, "clause": 7,
            "terms and conditions": 9, "governing law": 10, "arbitration": 9,
            "confidentiality": 8, "non-disclosure": 9, "nda": 9,
        },
        "tools": [
            {"name": "Protect PDF",  "path": "/protect-pdf",   "reason": "Password-protect sensitive contracts"},
            {"name": "PDF to Word",  "path": "/pdf-to-word",   "reason": "Convert to editable DOCX for redlining"},
            {"name": "Watermark PDF","path": "/watermark-pdf", "reason": "Mark as DRAFT or CONFIDENTIAL"},
        ],
    },
    "research": {
        "label": "Research Paper",
        "icon": "📚",
        "keywords": {
            "abstract": 9, "introduction": 6, "methodology": 9, "conclusion": 7,
            "references": 5, "figure": 4, "hypothesis": 10, "results": 6,
            "discussion": 7, "literature review": 10, "citation": 8,
            "doi": 9, "journal": 8, "proceedings": 9, "arxiv": 10,
            "et al": 9, "p-value": 10, "dataset": 7,
        },
        "tools": [
            {"name": "Merge PDF",    "path": "/merge-pdf",     "reason": "Combine multiple papers into one"},
            {"name": "Split PDF",    "path": "/split-pdf",     "reason": "Extract specific sections"},
            {"name": "PDF to Word",  "path": "/pdf-to-word",   "reason": "Extract text for editing or citation"},
        ],
    },
    "form": {
        "label": "Form / Application",
        "icon": "📋",
        "keywords": {
            "please fill": 9, "signature": 7, "date of birth": 9, "applicant": 8,
            "application form": 10, "first name": 7, "last name": 7,
            "address": 4, "phone number": 6, "email address": 5,
            "check one": 8, "select all": 8, "submit": 6, "authorized": 6,
        },
        "tools": [
            {"name": "Protect PDF", "path": "/protect-pdf",  "reason": "Lock the form before distribution"},
            {"name": "Compress PDF","path": "/compress-pdf", "reason": "Reduce size for web upload"},
        ],
    },
    "presentation": {
        "label": "Presentation / Slides",
        "icon": "🎯",
        "keywords": {
            "agenda": 8, "overview": 6, "thank you": 7, "slide": 9,
            "key takeaways": 9, "questions": 5, "presenter": 8,
            "bullet point": 7, "click to edit": 10, "powerpoint": 10,
        },
        "tools": [
            {"name": "Compress PDF", "path": "/compress-pdf", "reason": "Reduce deck size for sharing"},
            {"name": "PDF to JPG",   "path": "/pdf-to-jpg",   "reason": "Export each slide as an image"},
            {"name": "Split PDF",    "path": "/split-pdf",    "reason": "Extract specific slides"},
        ],
    },
    "manual": {
        "label": "Manual / Guide",
        "icon": "📖",
        "keywords": {
            "table of contents": 9, "installation": 8, "configuration": 8,
            "troubleshooting": 9, "appendix": 8, "chapter": 6, "section": 4,
            "step 1": 7, "step 2": 7, "warning": 5, "note:": 4,
            "getting started": 8, "requirements": 6, "setup": 6,
        },
        "tools": [
            {"name": "Split PDF",    "path": "/split-pdf",    "reason": "Split into individual chapters"},
            {"name": "Merge PDF",    "path": "/merge-pdf",    "reason": "Combine manual sections"},
            {"name": "Compress PDF", "path": "/compress-pdf", "reason": "Reduce manual size for distribution"},
        ],
    },
}

# ── Helpers ────────────────────────────────────────────────────────────────

def _extract_text(data: bytes, max_pages: int = 6) -> str:
    """Extract text from the first N pages via PyMuPDF."""
    try:
        import fitz
        doc = fitz.open(stream=data, filetype="pdf")
        pages = min(len(doc), max_pages)
        return " ".join(doc[i].get_text() for i in range(pages)).lower()
    except Exception:
        return ""


def _score_types(text: str) -> dict[str, float]:
    """Return a normalised probability dict for each document type."""
    raw: dict[str, float] = {}
    for dtype, cfg in DOCUMENT_TYPES.items():
        score = 0.0
        for kw, weight in cfg["keywords"].items():
            if kw in text:
                # Bonus for repeated occurrences (capped at 3×)
                count = min(text.count(kw), 3)
                score += weight * count
        raw[dtype] = score

    total = sum(raw.values()) or 1.0
    return {k: round(v / total, 4) for k, v in raw.items()}


# ── Endpoint 1: Document Type Detector ────────────────────────────────────

@router.post("/detect-type")
async def detect_document_type(file: UploadFile = File(...)):
    try:
        data = await file.read()
        check_size(data)

        text = _extract_text(data)
        if not text.strip():
            return {
                "type": "unknown", "label": "Unknown / Scanned",
                "icon": "❓", "confidence": 0.0,
                "description": "No extractable text found. This may be a scanned document.",
                "suggested_tools": [
                    {"name": "Compress PDF", "path": "/compress-pdf", "reason": "Reduce scanned PDF size"},
                    {"name": "PDF to JPG",   "path": "/pdf-to-jpg",   "reason": "Export pages as images"},
                ],
                "all_scores": {},
            }

        scores = _score_types(text)
        top_type = max(scores, key=scores.get)
        confidence = scores[top_type]
        cfg = DOCUMENT_TYPES[top_type]

        # Low-confidence fallback
        if confidence < 0.25:
            description = "Could not determine document type with high confidence."
        else:
            description = _generate_description(top_type, confidence)

        return {
            "type": top_type,
            "label": cfg["label"],
            "icon": cfg["icon"],
            "confidence": confidence,
            "description": description,
            "suggested_tools": cfg["tools"],
            "all_scores": scores,
        }

    except Exception as e:
        raise HTTPException(500, safe_error(e))


def _generate_description(dtype: str, conf: float) -> str:
    level = "very likely" if conf > 0.55 else "likely"
    descriptions = {
        "invoice":      f"This is {level} an invoice or billing document with financial data.",
        "resume":       f"This is {level} a resume or CV — a professional profile document.",
        "legal":        f"This is {level} a legal contract or agreement with formal clauses.",
        "research":     f"This is {level} an academic or research paper with structured content.",
        "form":         f"This is {level} a fillable form or application document.",
        "presentation": f"This is {level} a presentation or slide deck exported to PDF.",
        "manual":       f"This is {level} a user manual, guide, or technical documentation.",
    }
    return descriptions.get(dtype, "Document type identified.")


# ── Endpoint 2: Conversion Quality Predictor ──────────────────────────────

@router.post("/conversion-quality")
async def predict_conversion_quality(file: UploadFile = File(...)):
    """
    Predicts how clean a PDF→Word conversion will be.
    Returns a score (0-100) with a per-factor breakdown.
    """
    try:
        import fitz

        data = await file.read()
        check_size(data)

        doc = fitz.open(stream=data, filetype="pdf")
        total_pages = len(doc)
        if total_pages == 0:
            raise HTTPException(400, "Empty PDF")

        sample_pages = min(total_pages, 8)

        # ── Factor 1: Text extractability (0–40 pts) ──────────────────────
        total_chars = 0
        total_area  = 0.0
        for i in range(sample_pages):
            page = doc[i]
            total_chars += len(page.get_text().strip())
            r = page.rect
            total_area += r.width * r.height

        avg_chars_per_px = total_chars / max(total_area, 1)
        # ~0.03 chars/px² is a text-rich page; scale 0→40
        text_score = min(int(avg_chars_per_px / 0.03 * 40), 40)
        is_scanned = text_score < 8

        text_note = (
            "Rich text content — excellent extractability" if text_score >= 35 else
            "Moderate text density — good extractability" if text_score >= 20 else
            "Low text density — may be a scanned document" if text_score >= 8 else
            "No extractable text — this appears to be a scanned/image PDF"
        )

        # ── Factor 2: Image density (0–20 pts) ────────────────────────────
        total_images = sum(len(doc[i].get_images()) for i in range(sample_pages))
        avg_images = total_images / sample_pages
        # Fewer images = better conversion; 0 images → 20 pts, ≥5 → 0 pts
        image_score = max(0, int(20 - avg_images * 4))
        image_note = (
            "No images — clean text conversion expected" if avg_images == 0 else
            "Few images — minimal impact on conversion"  if avg_images < 2 else
            "Moderate image density — some layout may shift" if avg_images < 4 else
            "Heavy images — layout will likely change in Word"
        )

        # ── Factor 3: Font embedding (0–20 pts) ───────────────────────────
        font_entries = doc[0].get_fonts(full=True) if total_pages > 0 else []
        total_fonts    = len(font_entries)
        embedded_fonts = sum(1 for f in font_entries if f[3])  # f[3] = embedded flag
        embed_ratio = embedded_fonts / max(total_fonts, 1)
        font_score = int(embed_ratio * 20)
        font_note = (
            "All fonts embedded — text will render correctly" if embed_ratio >= 0.9 else
            "Most fonts embedded — minor rendering differences possible" if embed_ratio >= 0.6 else
            "Some fonts not embedded — text substitution likely" if embed_ratio >= 0.3 else
            "Fonts not embedded — significant text rendering issues expected"
        )

        # ── Factor 4: Layout complexity (0–20 pts) ────────────────────────
        layout_score, layout_note = _estimate_layout_complexity(doc, sample_pages)

        # ── Final score ───────────────────────────────────────────────────
        total_score = text_score + image_score + font_score + layout_score

        if total_score >= 80:
            grade, color = "Excellent", "green"
            recommendation = "Conversion should produce a very clean Word document with minimal manual cleanup."
        elif total_score >= 60:
            grade, color = "Good", "blue"
            recommendation = "Conversion will be mostly clean. Tables or multi-column sections may need minor adjustment."
        elif total_score >= 40:
            grade, color = "Fair", "yellow"
            recommendation = "Conversion will work but expect layout changes. Complex formatting will need manual fixes."
        else:
            grade, color = "Poor", "red"
            recommendation = (
                "This appears to be a scanned PDF. PDF→Word conversion will produce mostly images, not editable text. "
                "Consider OCR software for better results."
                if is_scanned else
                "Heavy images or complex layout will significantly affect conversion quality."
            )

        return {
            "score":          total_score,
            "grade":          grade,
            "color":          color,
            "is_scanned":     is_scanned,
            "total_pages":    total_pages,
            "recommendation": recommendation,
            "breakdown": [
                {"label": "Text Extractability", "score": text_score,  "max": 40, "note": text_note},
                {"label": "Image Density",        "score": image_score, "max": 20, "note": image_note},
                {"label": "Font Embedding",       "score": font_score,  "max": 20, "note": font_note},
                {"label": "Layout Simplicity",    "score": layout_score,"max": 20, "note": layout_note},
            ],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, safe_error(e))


def _estimate_layout_complexity(doc, sample_pages: int) -> tuple[int, str]:
    """
    Heuristic: count text blocks per page.
    A simple single-column page has ~1-3 blocks; a complex layout has many more.
    """
    try:
        block_counts = []
        for i in range(sample_pages):
            blocks = doc[i].get_text("blocks")
            # Only count text blocks (type 0), not images (type 1)
            text_blocks = [b for b in blocks if b[6] == 0]
            block_counts.append(len(text_blocks))

        avg_blocks = sum(block_counts) / max(len(block_counts), 1)

        if avg_blocks <= 4:
            return 20, "Simple single-column layout — converts cleanly"
        elif avg_blocks <= 10:
            return 15, "Standard layout — most content will convert well"
        elif avg_blocks <= 20:
            return 8,  "Multi-column or complex layout — some reflow expected"
        else:
            return 3,  "Very complex layout (tables, columns, sidebars) — significant reflow likely"
    except Exception:
        return 10, "Layout complexity could not be determined"
