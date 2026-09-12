import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import pdf, word, excel, html_tools, ml_tools, image

load_dotenv()

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3001").split(",")]
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# 25 MB in bytes — configurable via env var
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "25")) * 1024 * 1024

app = FastAPI(
    title="DocCraft API",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def enforce_upload_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_UPLOAD_BYTES:
        mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        return JSONResponse(
            status_code=413,
            content={"detail": f"File too large. Maximum allowed size is {mb} MB."},
        )
    return await call_next(request)


app.include_router(pdf.router,        prefix="/api/pdf",   tags=["PDF"])
app.include_router(word.router,       prefix="/api/word",  tags=["Word"])
app.include_router(excel.router,      prefix="/api/excel", tags=["Excel"])
app.include_router(html_tools.router, prefix="/api/html",  tags=["HTML"])
app.include_router(ml_tools.router,  prefix="/api/ml",    tags=["ML"])
app.include_router(image.router,     prefix="/api/image", tags=["Image"])


@app.get("/")
def root():
    return {"status": "ok", "service": "DocCraft API", "env": ENVIRONMENT}


@app.get("/health")
def health():
    return {"status": "healthy"}
