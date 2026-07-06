"""Workflow orchestration routes."""
from __future__ import annotations

import threading

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.models import ProcurementRequest, Vendor, WorkflowRun
from app.schemas import (
    WorkflowStartRequest,
    WorkflowRunResponse,
    WorkflowStatusResponse,
    AgentResultResponse,
    WorkflowLogResponse,
)
from app.services.agent_engine import WorkflowEngine

router = APIRouter(prefix="/api/workflow", tags=["Workflow"])


@router.post("/start", response_model=WorkflowRunResponse, status_code=201)
def start_workflow(payload: WorkflowStartRequest, db: Session = Depends(get_db)):
    pr = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == payload.procurement_request_id
    ).first()
    if not pr:
        raise HTTPException(404, "Procurement request not found")

    run = WorkflowRun(
        procurement_request_id=pr.id,
        status="running",
        current_agent_index=0,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Run agents in background thread
    run_id = run.id
    thread = threading.Thread(target=_run_workflow_bg, args=(run_id, pr.id), daemon=True)
    thread.start()

    return run


def _run_workflow_bg(run_id: int, pr_id: int) -> None:
    """Execute the 9-agent pipeline in a background thread."""
    db = SessionLocal()
    try:
        pr = db.query(ProcurementRequest).filter(ProcurementRequest.id == pr_id).first()
        vendors = db.query(Vendor).all()
        run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
        if not pr or not run:
            return

        engine = WorkflowEngine(db=db, workflow_run=run, procurement_request=pr, vendors=vendors)
        engine.execute()
    finally:
        db.close()


@router.get("/runs", response_model=list[WorkflowRunResponse])
def list_runs(db: Session = Depends(get_db)):
    return db.query(WorkflowRun).order_by(WorkflowRun.started_at.desc()).all()


@router.get("/{run_id}/status", response_model=WorkflowStatusResponse)
def get_workflow_status(run_id: int, db: Session = Depends(get_db)):
    run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Workflow run not found")

    return WorkflowStatusResponse(
        id=run.id,
        procurement_request_id=run.procurement_request_id,
        status=run.status,
        current_agent_index=run.current_agent_index,
        started_at=run.started_at,
        completed_at=run.completed_at,
        agents=[
            AgentResultResponse(
                id=ar.id,
                workflow_run_id=ar.workflow_run_id,
                agent_id=ar.agent_id,
                agent_name=ar.agent_name,
                status=ar.status,
                input_data=ar.input_data,
                output_data=ar.output_data,
                started_at=ar.started_at,
                completed_at=ar.completed_at,
                retry_count=ar.retry_count,
            )
            for ar in run.agent_results
        ],
        logs=[
            WorkflowLogResponse(
                id=log.id,
                workflow_run_id=log.workflow_run_id,
                agent_id=log.agent_id,
                agent_name=log.agent_name,
                level=log.level,
                message=log.message,
                timestamp=log.timestamp,
            )
            for log in run.logs
        ],
    )
