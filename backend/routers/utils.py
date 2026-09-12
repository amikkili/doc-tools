import os
from fastapi import HTTPException

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "25")) * 1024 * 1024


def check_size(data: bytes, label: str = "File") -> None:
    """Raise HTTP 413 if data exceeds MAX_UPLOAD_BYTES."""
    if len(data) > MAX_UPLOAD_BYTES:
        mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"{label} too large. Maximum allowed size is {mb} MB.",
        )
