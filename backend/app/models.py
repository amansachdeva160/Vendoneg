"""
AI Procurement Copilot — SQLAlchemy ORM Models
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    username: str = Column(String(100), unique=True, nullable=False)
    email: str = Column(String(255), unique=True, nullable=False)
    role: str = Column(String(50), default="procurement_officer")
    created_at: datetime = Column(DateTime, default=_utcnow)


# ---------------------------------------------------------------------------
# Procurement Request
# ---------------------------------------------------------------------------
class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id: int = Column(Integer, primary_key=True, index=True)
    item_name: str = Column(String(255), nullable=False)
    category: str = Column(String(100), nullable=False)
    quantity: int = Column(Integer, nullable=False)
    budget: float = Column(Float, nullable=False)
    currency: str = Column(String(10), default="USD")
    delivery_deadline: str = Column(String(50), nullable=True)
    quality_requirement: str = Column(String(50), default="standard")
    special_requirements: str = Column(Text, nullable=True)
    status: str = Column(String(50), default="draft")
    created_at: datetime = Column(DateTime, default=_utcnow)
    updated_at: datetime = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    # relationships
    workflow_runs = relationship("WorkflowRun", back_populates="procurement_request")


# ---------------------------------------------------------------------------
# Vendor
# ---------------------------------------------------------------------------
class Vendor(Base):
    __tablename__ = "vendors"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(200), nullable=False)
    category: str = Column(String(100), nullable=False)
    rating: float = Column(Float, default=0.0)
    location: str = Column(String(200), nullable=True)
    contact: str = Column(String(200), nullable=True)
    email: str = Column(String(255), nullable=True)
    years_in_business: int = Column(Integer, default=0)
    risk_level: str = Column(String(50), default="medium")
    status: str = Column(String(50), default="active")


# ---------------------------------------------------------------------------
# Workflow Run
# ---------------------------------------------------------------------------
class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id: int = Column(Integer, primary_key=True, index=True)
    procurement_request_id: int = Column(
        Integer, ForeignKey("procurement_requests.id"), nullable=False
    )
    status: str = Column(String(50), default="pending")
    current_agent_index: int = Column(Integer, default=0)
    started_at: datetime = Column(DateTime, default=_utcnow)
    completed_at: datetime | None = Column(DateTime, nullable=True)

    # relationships
    procurement_request = relationship(
        "ProcurementRequest", back_populates="workflow_runs"
    )
    agent_results = relationship(
        "AgentResult", back_populates="workflow_run", order_by="AgentResult.agent_id"
    )
    logs = relationship(
        "WorkflowLog", back_populates="workflow_run", order_by="WorkflowLog.timestamp"
    )


# ---------------------------------------------------------------------------
# Agent Result
# ---------------------------------------------------------------------------
class AgentResult(Base):
    __tablename__ = "agent_results"

    id: int = Column(Integer, primary_key=True, index=True)
    workflow_run_id: int = Column(
        Integer, ForeignKey("workflow_runs.id"), nullable=False
    )
    agent_id: int = Column(Integer, nullable=False)
    agent_name: str = Column(String(200), nullable=False)
    status: str = Column(String(50), default="pending")
    _input_data: str = Column("input_data", Text, nullable=True)
    _output_data: str = Column("output_data", Text, nullable=True)
    started_at: datetime | None = Column(DateTime, nullable=True)
    completed_at: datetime | None = Column(DateTime, nullable=True)
    retry_count: int = Column(Integer, default=0)

    # relationships
    workflow_run = relationship("WorkflowRun", back_populates="agent_results")

    # --- JSON helpers -------------------------------------------------------
    @property
    def input_data(self) -> dict | None:
        return json.loads(self._input_data) if self._input_data else None

    @input_data.setter
    def input_data(self, value: dict | None) -> None:
        self._input_data = json.dumps(value) if value is not None else None

    @property
    def output_data(self) -> dict | None:
        return json.loads(self._output_data) if self._output_data else None

    @output_data.setter
    def output_data(self, value: dict | None) -> None:
        self._output_data = json.dumps(value) if value is not None else None


# ---------------------------------------------------------------------------
# Workflow Log
# ---------------------------------------------------------------------------
class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id: int = Column(Integer, primary_key=True, index=True)
    workflow_run_id: int = Column(
        Integer, ForeignKey("workflow_runs.id"), nullable=False
    )
    agent_id: int | None = Column(Integer, nullable=True)
    agent_name: str | None = Column(String(200), nullable=True)
    level: str = Column(String(20), default="INFO")
    message: str = Column(Text, nullable=False)
    timestamp: datetime = Column(DateTime, default=_utcnow)

    # relationships
    workflow_run = relationship("WorkflowRun", back_populates="logs")
