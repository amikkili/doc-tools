import os
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "25")) * 1024 * 1024

_ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def check_size(data: bytes, label: str = "File") -> None:
    """Raise HTTP 413 if data exceeds MAX_UPLOAD_BYTES."""
    if len(data) > MAX_UPLOAD_BYTES:
        mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"{label} too large. Maximum allowed size is {mb} MB.",
        )


def safe_error(e: Exception) -> str:
    """Log the real error; return a client-safe message in production."""
    logger.error("Processing error: %s", e, exc_info=True)
    if _ENVIRONMENT == "production":
        return "Processing failed. Please check your file and try again."
    return str(e)


# Magic-byte signatures for common file types
_SIGNATURES: dict[str, list[bytes]] = {
    "pdf":   [b"%PDF"],
    "docx":  [b"PK\x03\x04"],   # ZIP-based (covers docx, xlsx, pptx)
    "xlsx":  [b"PK\x03\x04"],
    "pptx":  [b"PK\x03\x04"],
    "image": [
        b"\xff\xd8\xff",   # JPEG
        b"\x89PNG",        # PNG
        b"RIFF",           # WebP (RIFF....WEBP)
        b"GIF8",           # GIF
        b"BM",             # BMP
    ],
}

_TYPE_LABELS: dict[str, str] = {
    "pdf":   "PDF (.pdf)",
    "docx":  "Word document (.doc / .docx)",
    "xlsx":  "Excel spreadsheet (.xls / .xlsx)",
    "pptx":  "PowerPoint file (.ppt / .pptx)",
    "image": "image (JPEG, PNG, WebP, GIF, BMP)",
}


def validate_content_type(data: bytes, expected: str, label: str = "File") -> None:
    """
    Check magic bytes to verify the file matches the expected type.
    Raises HTTP 400 with a clear message if the file does not match.
    """
    sigs = _SIGNATURES.get(expected)
    if not sigs or not data:
        return
    if not any(data[:len(sig)] == sig for sig in sigs):
        friendly = _TYPE_LABELS.get(expected, expected)
        raise HTTPException(
            status_code=400,
            detail=f"{label} does not appear to be a valid {friendly}. "
                   f"Please upload the correct file type.",
        )
