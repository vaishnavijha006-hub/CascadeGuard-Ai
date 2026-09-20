from typing import List
from pydantic import BaseModel, Field, field_validator


class CascadeRequest(BaseModel):
    start_node: str = Field(..., description="ID of the starting node where failure originates")


class CascadeResponse(BaseModel):
    start_node: str
    affected_nodes: List[str]
    cascade_depth: int
    affected_count: int
    risk_score: int
    severity: str
    critical_nodes: List[str]


class PriorityAction(BaseModel):
    priority: str = Field(..., description="Priority tier e.g. HIGH, MEDIUM, LOW")
    action: str = Field(..., description="Recommended action item")
    reason: str = Field(..., description="Justification based on cascade analysis")


class IncidentBrief(BaseModel):
    summary: str = Field(..., description="Brief executive summary of the simulated incident")
    key_impacts: List[str] = Field(..., description="List of key impacted areas")
    priority_actions: List[PriorityAction] = Field(..., description="Prioritized mitigation actions")
    responder_note: str = Field(..., description="Operational guidance for responders")


# --- Incident Analyze API Schemas ---

class IncidentAnalyzeRequest(BaseModel):
    incident_type: str = Field(..., min_length=1, description="Type of incident e.g. Power Failure")
    incident_description: str = Field(..., min_length=1, description="Narrative description of the incident")
    start_node: str = Field(..., min_length=1, description="ID of origin node where failure starts")

    @field_validator("incident_type", "incident_description", "start_node")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Field cannot be empty or whitespace only.")
        return value.strip()


class IncidentDetail(BaseModel):
    type: str
    description: str
    start_node: str


class CascadeDetail(BaseModel):
    affected_nodes: List[str]
    cascade_depth: int
    affected_count: int


class RiskDetail(BaseModel):
    risk_score: int
    severity: str
    critical_nodes: List[str]


class IncidentAnalyzeResponse(BaseModel):
    incident: IncidentDetail
    cascade: CascadeDetail
    risk: RiskDetail
    ai_analysis: IncidentBrief


# --- Dependency Graph API Schemas ---

class NodeSchema(BaseModel):
    id: str = Field(..., description="Unique node identifier")
    label: str = Field(..., description="Display label of the infrastructure node")
    sector: str = Field(..., description="Infrastructure sector/domain")
    criticality: int = Field(..., description="Criticality rating (1 to 5)")


class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node ID of directed dependency")
    target: str = Field(..., description="Target node ID of directed dependency")


class GraphResponse(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
