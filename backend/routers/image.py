import io
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from .utils import check_size

router = APIRouter()


def stream(buf: io.BytesIO, filename: str, media_type: str) -> StreamingResponse:
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── HEIC / HEIF → JPEG ────────────────────────────────────────────────────

@router.post("/heic-to-jpg")
async def heic_to_jpg(file: UploadFile = File(...), quality: int = Form(95)):
    try:
        import pillow_heif
        from PIL import Image

        pillow_heif.register_heif_opener()

        data = await file.read()
        check_size(data)

        img = Image.open(io.BytesIO(data))

        # Convert to RGB (HEIC may be RGBA or other modes)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=min(max(quality, 1), 95), optimize=True)

        stem = (file.filename or "photo").rsplit(".", 1)[0]
        return stream(buf, f"{stem}.jpg", "image/jpeg")

    except ImportError:
        raise HTTPException(
            503,
            "HEIC conversion requires pillow-heif. "
            "Install with: pip install pillow-heif"
        )
    except Exception as e:
        raise HTTPException(500, str(e))
