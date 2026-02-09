# AkShare Sidecar 主入口
from fastapi import FastAPI
from app.routers import quote

app = FastAPI(
    title="AkShare Sidecar",
    description="A股行情数据代理服务",
    version="0.1.0",
)

app.include_router(quote.router, prefix="/v1/quote", tags=["行情"])


@app.get("/health")
def health():
    return {"status": "ok"}
