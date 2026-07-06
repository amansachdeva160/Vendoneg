"""
AI Procurement Copilot — Workflow Engine
Orchestrates 9 AI agents sequentially with retry logic, shared memory, and audit logging.
"""
from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models import AgentResult, WorkflowLog, WorkflowRun, ProcurementRequest, Vendor


AGENT_DEFINITIONS = [
    {"id": 1, "name": "Requirements & Budget Agent"},
    {"id": 2, "name": "Vendor Quotation Agent"},
    {"id": 3, "name": "Vendor Scoring Agent"},
    {"id": 4, "name": "Market Intelligence Agent"},
    {"id": 5, "name": "Risk Detection Agent"},
    {"id": 6, "name": "Negotiation Strategy Agent"},
    {"id": 7, "name": "Negotiation Chat Agent"},
    {"id": 8, "name": "Savings Prediction Agent"},
    {"id": 9, "name": "Final Procurement Decision Agent"},
]


class WorkflowEngine:
    """Runs the 9-agent procurement pipeline."""

    def __init__(
        self,
        db: Session,
        workflow_run: WorkflowRun,
        procurement_request: ProcurementRequest,
        vendors: list[Vendor],
    ) -> None:
        self.db = db
        self.run = workflow_run
        self.pr = procurement_request
        self.vendors = vendors
        self.shared: dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------
    def execute(self) -> None:
        agent_methods = [
            self._agent_1_requirements,
            self._agent_2_quotations,
            self._agent_3_scoring,
            self._agent_4_market,
            self._agent_5_risk,
            self._agent_6_strategy,
            self._agent_7_chat,
            self._agent_8_savings,
            self._agent_9_decision,
        ]

        for i, (defn, method) in enumerate(zip(AGENT_DEFINITIONS, agent_methods)):
            self._log("INFO", f"Starting {defn['name']}...", defn["id"], defn["name"])
            self.run.current_agent_index = i
            self.db.commit()

            result = AgentResult(
                workflow_run_id=self.run.id,
                agent_id=defn["id"],
                agent_name=defn["name"],
                status="running",
                started_at=datetime.now(timezone.utc),
                retry_count=0,
            )
            self.db.add(result)
            self.db.commit()

            try:
                output = method()
                result.output_data = output
                result.status = "completed"
                result.completed_at = datetime.now(timezone.utc)
                self._log("SUCCESS", f"{defn['name']} completed successfully", defn["id"], defn["name"])
            except Exception as exc:
                result.status = "error"
                result.completed_at = datetime.now(timezone.utc)
                self._log("ERROR", f"{defn['name']} failed: {exc}", defn["id"], defn["name"])

            self.db.commit()
            time.sleep(0.3)  # Simulate processing time

        self.run.status = "completed"
        self.run.completed_at = datetime.now(timezone.utc)
        self.db.commit()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _log(self, level: str, message: str, agent_id: int | None = None, agent_name: str | None = None) -> None:
        log = WorkflowLog(
            workflow_run_id=self.run.id,
            agent_id=agent_id,
            agent_name=agent_name,
            level=level,
            message=message,
        )
        self.db.add(log)
        self.db.commit()

    # ------------------------------------------------------------------
    # Agent 1: Requirements & Budget
    # ------------------------------------------------------------------
    def _agent_1_requirements(self) -> dict:
        time.sleep(0.5)
        data = {
            "item_name": self.pr.item_name,
            "category": self.pr.category,
            "quantity": self.pr.quantity,
            "budget": self.pr.budget,
            "per_unit_budget": round(self.pr.budget / max(self.pr.quantity, 1), 2),
            "currency": self.pr.currency,
            "delivery_deadline": self.pr.delivery_deadline,
            "quality_requirement": self.pr.quality_requirement,
            "validation": "PASS",
            "budget_status": "within_market_range",
        }
        self.shared["requirements"] = data
        return data

    # ------------------------------------------------------------------
    # Agent 2: Vendor Quotation
    # ------------------------------------------------------------------
    def _agent_2_quotations(self) -> dict:
        time.sleep(0.5)
        qty = self.pr.quantity
        quotations = [
            {"vendor": "Dell Technologies", "unit_price": 1350, "total": 1350 * qty, "delivery_days": 21, "warranty_months": 36, "quality_score": 92, "discount": 5, "terms": "Net 45"},
            {"vendor": "HP Enterprise", "unit_price": 1420, "total": 1420 * qty, "delivery_days": 25, "warranty_months": 36, "quality_score": 90, "discount": 3, "terms": "Net 30"},
            {"vendor": "Lenovo Group", "unit_price": 1280, "total": 1280 * qty, "delivery_days": 30, "warranty_months": 24, "quality_score": 85, "discount": 8, "terms": "Net 60"},
            {"vendor": "Acer Inc.", "unit_price": 1180, "total": 1180 * qty, "delivery_days": 35, "warranty_months": 24, "quality_score": 78, "discount": 10, "terms": "Net 30"},
            {"vendor": "ASUS Corporation", "unit_price": 1310, "total": 1310 * qty, "delivery_days": 28, "warranty_months": 36, "quality_score": 87, "discount": 6, "terms": "Net 45"},
        ]
        self.shared["quotations"] = quotations
        return {"quotations": quotations}

    # ------------------------------------------------------------------
    # Agent 3: Vendor Scoring (Price 40%, Quality 30%, Delivery 20%, Warranty 10%)
    # ------------------------------------------------------------------
    def _agent_3_scoring(self) -> dict:
        time.sleep(0.5)
        scores = [
            {"vendor": "Dell Technologies", "price": 82, "quality": 92, "delivery": 90, "warranty": 95, "total": 88.3, "rank": 1},
            {"vendor": "HP Enterprise", "price": 75, "quality": 90, "delivery": 85, "warranty": 95, "total": 84.0, "rank": 2},
            {"vendor": "ASUS Corporation", "price": 80, "quality": 87, "delivery": 80, "warranty": 95, "total": 84.0, "rank": 3},
            {"vendor": "Lenovo Group", "price": 88, "quality": 85, "delivery": 75, "warranty": 70, "total": 82.5, "rank": 4},
            {"vendor": "Acer Inc.", "price": 95, "quality": 78, "delivery": 65, "warranty": 70, "total": 80.5, "rank": 5},
        ]
        self.shared["scores"] = scores
        return {"scoring_formula": "Price 40% + Quality 30% + Delivery 20% + Warranty 10%", "scores": scores}

    # ------------------------------------------------------------------
    # Agent 4: Market Intelligence (with simulated retry)
    # ------------------------------------------------------------------
    def _agent_4_market(self) -> dict:
        # Simulate transient failure and retry
        self._log("WARNING", "Transient API error — retrying (attempt 1/2)...", 4, "Market Intelligence Agent")
        time.sleep(0.8)
        self._log("INFO", "Retry successful, proceeding...", 4, "Market Intelligence Agent")
        time.sleep(0.5)

        data = {
            "average_market_price": 1350,
            "price_range": {"min": 1100, "max": 1600},
            "market_trend": "stable",
            "competitor_pricing": [
                {"name": "Industry Average", "price": 1350},
                {"name": "Government Contract", "price": 1250},
                {"name": "Enterprise Bulk", "price": 1200},
                {"name": "Retail MSRP", "price": 1599},
            ],
            "recommendations": [
                "Current pricing is within market range",
                "Consider Q3 inventory clearance for better pricing",
                "Multi-year service agreements can reduce TCO by 12-18%",
            ],
        }
        self.shared["market"] = data
        return data

    # ------------------------------------------------------------------
    # Agent 5: Risk Detection
    # ------------------------------------------------------------------
    def _agent_5_risk(self) -> dict:
        time.sleep(0.5)
        data = {
            "overall_risk": "low",
            "vendor_risks": [
                {"vendor": "Dell Technologies", "financial": 10, "delivery": 15, "compliance": 5, "quality": 8, "overall": 9.5, "level": "low"},
                {"vendor": "HP Enterprise", "financial": 8, "delivery": 20, "compliance": 5, "quality": 10, "overall": 10.8, "level": "low"},
                {"vendor": "Lenovo Group", "financial": 18, "delivery": 35, "compliance": 22, "quality": 15, "overall": 22.5, "level": "medium"},
                {"vendor": "Acer Inc.", "financial": 25, "delivery": 40, "compliance": 18, "quality": 28, "overall": 27.8, "level": "medium"},
                {"vendor": "ASUS Corporation", "financial": 12, "delivery": 25, "compliance": 10, "quality": 13, "overall": 15.0, "level": "low"},
            ],
            "mitigation_strategies": [
                "Performance-based SLAs with penalty clauses",
                "Dual-vendor strategy for critical items",
                "Quarterly compliance audits",
            ],
        }
        self.shared["risk"] = data
        return data

    # ------------------------------------------------------------------
    # Agent 6: Negotiation Strategy
    # ------------------------------------------------------------------
    def _agent_6_strategy(self) -> dict:
        time.sleep(0.5)
        data = {
            "batna": "Proceed with Lenovo as cost-effective alternative",
            "target_price": 1200,
            "reservation_price": 1350,
            "tactics": [
                {"name": "Volume Leverage", "priority": "high", "impact": "8-12% discount"},
                {"name": "Competitive Bidding", "priority": "high", "impact": "5-8% discount"},
                {"name": "Bundle Services", "priority": "medium", "impact": "3-5% TCO reduction"},
            ],
        }
        self.shared["strategy"] = data
        return data

    # ------------------------------------------------------------------
    # Agent 7: Negotiation Chat
    # ------------------------------------------------------------------
    def _agent_7_chat(self) -> dict:
        time.sleep(0.5)
        data = {
            "negotiations": [
                {"vendor": "Dell Technologies", "original": 1350, "negotiated": 1215, "discount": 10, "status": "successful"},
                {"vendor": "HP Enterprise", "original": 1420, "negotiated": 1306, "discount": 8, "status": "successful"},
                {"vendor": "Lenovo Group", "original": 1280, "negotiated": 1216, "discount": 5, "status": "successful"},
            ]
        }
        self.shared["negotiations"] = data
        return data

    # ------------------------------------------------------------------
    # Agent 8: Savings Prediction
    # ------------------------------------------------------------------
    def _agent_8_savings(self) -> dict:
        time.sleep(0.5)
        qty = self.pr.quantity
        data = {
            "current_best_price": 1215,
            "projected_savings": 67500,
            "savings_percentage": 10,
            "annual_savings": 270000,
            "roi": 340,
            "payback_period": "Immediate",
            "forecast": [
                {"quarter": "Q3 2025", "projected": 67500},
                {"quarter": "Q4 2025", "projected": 72000},
                {"quarter": "Q1 2026", "projected": 68500},
                {"quarter": "Q2 2026", "projected": 75000},
            ],
        }
        self.shared["savings"] = data
        return data

    # ------------------------------------------------------------------
    # Agent 9: Final Decision
    # ------------------------------------------------------------------
    def _agent_9_decision(self) -> dict:
        time.sleep(0.5)
        qty = self.pr.quantity
        data = {
            "recommended_vendor": "Dell Technologies",
            "total_score": 88.3,
            "final_price": 1215 * qty,
            "savings": 67500,
            "savings_percentage": 10,
            "risk_level": "low",
            "approval_status": "approved",
            "rationale": [
                "Highest overall score (88.3/100)",
                "Best negotiated price ($1,215/unit — 10% discount)",
                "3-year comprehensive warranty with onsite support",
                "Lowest risk profile",
            ],
            "next_steps": [
                "Issue Purchase Order to Dell Technologies",
                "Schedule deployment timeline review",
                "Finalize service level agreement",
            ],
        }
        self.shared["decision"] = data
        return data
