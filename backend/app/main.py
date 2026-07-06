"""
AI Procurement Copilot — FastAPI Application Entry Point
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.models import User, Vendor, ProcurementRequest
from app.routers import procurement, vendors, workflow, market_intel


# ---------------------------------------------------------------------------
# Lifespan — create tables & seed demo data on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)
    _seed_demo_data()
    yield


def _seed_demo_data() -> None:
    """Insert demo vendors if the table is empty."""
    db = SessionLocal()
    try:
        if db.query(Vendor).count() > 0:
            return

        demo_vendors = [
            Vendor(name="Dell Technologies", category="IT Hardware", rating=4.5, location="Austin, TX", contact="John Mitchell", email="enterprise@dell.com", years_in_business=40, risk_level="low", status="active"),
            Vendor(name="HP Enterprise", category="IT Hardware", rating=4.3, location="Palo Alto, CA", contact="Sarah Chen", email="procurement@hp.com", years_in_business=85, risk_level="low", status="active"),
            Vendor(name="Lenovo Group", category="IT Hardware", rating=4.1, location="Beijing, China", contact="Wei Zhang", email="business@lenovo.com", years_in_business=40, risk_level="medium", status="active"),
            Vendor(name="Acer Inc.", category="IT Hardware", rating=3.8, location="Taipei, Taiwan", contact="Ming Liu", email="corporate@acer.com", years_in_business=48, risk_level="medium", status="active"),
            Vendor(name="ASUS Corporation", category="IT Hardware", rating=4.0, location="Taipei, Taiwan", contact="Yuki Tanaka", email="b2b@asus.com", years_in_business=35, risk_level="low", status="active"),
        ]
        db.add_all(demo_vendors)
        db.commit()
    finally:
        db.close()


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Procurement Copilot API",
    description="Enterprise-grade AI-powered procurement & vendor negotiation platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(procurement.router)
app.include_router(vendors.router)
app.include_router(workflow.router)
app.include_router(market_intel.router)


@app.get("/")
def root():
    return {
        "name": "AI Procurement Copilot API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": ["/api/procurement", "/api/vendors", "/api/workflow"],
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
