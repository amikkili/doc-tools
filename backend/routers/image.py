import io
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from .utils import check_size, safe_error, validate_content_type

router = APIRouter()


def stream(buf: io.BytesIO, filename: str, media_type: str) -> StreamingResponse:
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── Image Process (resize / convert / filter) ─────────────────────────────

@router.post("/process")
async def process_image(
    file: UploadFile = File(...),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    maintain_aspect: bool = Form(True),
    output_format: str = Form("jpeg"),
    quality: int = Form(90),
    grayscale: bool = Form(False),
):
    try:
        from PIL import Image

        data = await file.read()
        check_size(data)
        validate_content_type(data, "image", file.filename or "File")

        img = Image.open(io.BytesIO(data))
        orig_w, orig_h = img.size

        # Compute target dimensions
        target_w, target_h = orig_w, orig_h
        if width and height:
            target_w, target_h = width, height
        elif width:
            target_w = width
            target_h = round(orig_h * width / orig_w) if maintain_aspect else orig_h
        elif height:
            target_h = height
            target_w = round(orig_w * height / orig_h) if maintain_aspect else orig_w

        if (target_w, target_h) != (orig_w, orig_h):
            img = img.resize((target_w, target_h), Image.LANCZOS)

        if grayscale:
            img = img.convert("L")

        fmt = output_format.lower()
        if fmt == "jpg":
            fmt = "jpeg"
        if fmt not in ("jpeg", "png", "webp"):
            fmt = "jpeg"

        # JPEG / WebP cannot have alpha channel
        if fmt in ("jpeg",) and img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
            img = bg
        elif img.mode == "P":
            img = img.convert("RGBA" if fmt == "png" else "RGB")

        buf = io.BytesIO()
        save_kwargs = {"format": fmt.upper()}
        if fmt in ("jpeg", "webp"):
            save_kwargs["quality"] = max(1, min(quality, 95))
            save_kwargs["optimize"] = True
        img.save(buf, **save_kwargs)

        ext = "jpg" if fmt == "jpeg" else fmt
        stem = (file.filename or "image").rsplit(".", 1)[0]
        media_type = f"image/{'jpeg' if fmt == 'jpeg' else fmt}"
        return stream(buf, f"{stem}_resized.{ext}", media_type)

    except Exception as e:
        raise HTTPException(500, safe_error(e))


# ── HEIC / HEIF → JPEG ────────────────────────────────────────────────────

@router.post("/heic-to-jpg")
async def heic_to_jpg(file: UploadFile = File(...), quality: int = Form(95)):
    try:
        import pillow_heif
        from PIL import Image

        pillow_heif.register_heif_opener()

        data = await file.read()
        check_size(data)
        validate_content_type(data, "image", file.filename or "File")

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
        raise HTTPException(500, safe_error(e))
