"""Vendor management routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vendor
from app.schemas import VendorCreate, VendorResponse

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


@router.get("/", response_model=list[VendorResponse])
def list_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()


@router.post("/", response_model=VendorResponse, status_code=201)
def create_vendor(payload: VendorCreate, db: Session = Depends(get_db)):
    obj = Vendor(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    obj = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not obj:
        raise HTTPException(404, "Vendor not found")
    return obj
