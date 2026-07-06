"""
AI Procurement Copilot — Pydantic v2 Schemas
Request / Response models for all API endpoints.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════════════════
# Procurement Request
# ═══════════════════════════════════════════════════════════════════════════
class ProcurementRequestCreate(BaseModel):
    model_config = ConfigDict(strict=False)

    item_name: str = Field(..., min_length=1, examples=["Laptop"])
    category: str = Field(..., min_length=1, examples=["Electronics"])
    quantity: int = Field(..., gt=0, examples=[500])
    budget: float = Field(..., gt=0, examples=[750000])
    currency: str = Field(default="USD", examples=["USD"])
    delivery_deadline: str | None = Field(default=None, examples=["2026-09-30"])
    quality_requirement: str = Field(default="standard", examples=["high"])
    special_requirements: str | None = Field(default=None, examples=["ISO 27001"])


class ProcurementRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_name: str
    category: str
    quantity: int
    budget: float
    currency: str
    delivery_deadline: str | None = None
    quality_requirement: str
    special_requirements: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════
# Vendor
# ═══════════════════════════════════════════════════════════════════════════
class VendorCreate(BaseModel):
    model_config = ConfigDict(strict=False)

    name: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    rating: float = Field(default=0.0, ge=0, le=5)
    location: str | None = None
    contact: str | None = None
    email: str | None = None
    years_in_business: int = Field(default=0, ge=0)
    risk_level: str = Field(default="medium")
    status: str = Field(default="active")


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    rating: float
    location: str | None = None
    contact: str | None = None
    email: str | None = None
    years_in_business: int
    risk_level: str
    status: str


# ═══════════════════════════════════════════════════════════════════════════
# Workflow
# ═══════════════════════════════════════════════════════════════════════════
class WorkflowStartRequest(BaseModel):
    model_config = ConfigDict(strict=False)

    procurement_request_id: int


class AgentResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_run_id: int
    agent_id: int
    agent_name: str
    status: str
    input_data: dict[str, Any] | None = None
    output_data: dict[str, Any] | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    retry_count: int


class WorkflowLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_run_id: int
    agent_id: int | None = None
    agent_name: str | None = None
    level: str
    message: str
    timestamp: datetime


class WorkflowRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    procurement_request_id: int
    status: str
    current_agent_index: int
    started_at: datetime
    completed_at: datetime | None = None


class WorkflowStatusResponse(BaseModel):
    """Full workflow status including nested agent results and logs."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    procurement_request_id: int
    status: str
    current_agent_index: int
    started_at: datetime
    completed_at: datetime | None = None
    agents: list[AgentResultResponse] = []
    logs: list[WorkflowLogResponse] = []
