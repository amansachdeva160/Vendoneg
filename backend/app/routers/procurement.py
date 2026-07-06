"""Procurement request routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ProcurementRequest
from app.schemas import ProcurementRequestCreate, ProcurementRequestResponse

router = APIRouter(prefix="/api/procurement", tags=["Procurement"])


@router.get("/", response_model=list[ProcurementRequestResponse])
def list_requests(db: Session = Depends(get_db)):
    return db.query(ProcurementRequest).order_by(ProcurementRequest.created_at.desc()).all()


@router.post("/", response_model=ProcurementRequestResponse, status_code=201)
def create_request(payload: ProcurementRequestCreate, db: Session = Depends(get_db)):
    obj = ProcurementRequest(**payload.model_dump())
    obj.status = "active"
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{request_id}", response_model=ProcurementRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    obj = db.query(ProcurementRequest).filter(ProcurementRequest.id == request_id).first()
    if not obj:
        raise HTTPException(404, "Procurement request not found")
    return obj


@router.put("/{request_id}", response_model=ProcurementRequestResponse)
def update_request(request_id: int, payload: ProcurementRequestCreate, db: Session = Depends(get_db)):
    obj = db.query(ProcurementRequest).filter(ProcurementRequest.id == request_id).first()
    if not obj:
        raise HTTPException(404, "Procurement request not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj
