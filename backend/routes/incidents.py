from fastapi import APIRouter, HTTPException, status

try:
    from backend.models.schemas import IncidentAnalyzeRequest, IncidentAnalyzeResponse
    from backend.services.cascade_engine import simulate_cascade
    from backend.services.risk_engine import calculate_risk
    from backend.services.llm import generate_incident_brief
except ImportError:
    from models.schemas import IncidentAnalyzeRequest, IncidentAnalyzeResponse
    from services.cascade_engine import simulate_cascade
    from services.risk_engine import calculate_risk
    from services.llm import generate_incident_brief

router = APIRouter(prefix="/incident", tags=["Incident Analysis"])


@router.post("/analyze", response_model=IncidentAnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze_incident(request: IncidentAnalyzeRequest):
    """
    Main CascadeGuard incident analysis endpoint.
    Combines deterministic cascade simulation, risk scoring, and AI responder brief.
    """
    # 1. Execute deterministic cascade simulation & risk assessment
    try:
        cascade_result = simulate_cascade(request.start_node)
        risk_result = calculate_risk(request.start_node)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backend simulation failed: {str(e)}"
        )

    # 2. Call AI/LLM service for responder brief generation
    try:
        ai_brief = generate_incident_brief(
            incident_type=request.incident_type,
            incident_description=request.incident_description,
            cascade_result=cascade_result,
            risk_result=risk_result,
            allow_fallback=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI analysis service unavailable: {str(e)}"
        )

    # 3. Construct authoritative combined response
    return {
        "incident": {
            "type": request.incident_type,
            "description": request.incident_description,
            "start_node": request.start_node
        },
        "cascade": {
            "affected_nodes": cascade_result["affected_nodes"],
            "cascade_depth": cascade_result["cascade_depth"],
            "affected_count": cascade_result["affected_count"]
        },
        "risk": {
            "risk_score": risk_result["risk_score"],
            "severity": risk_result["severity"],
            "critical_nodes": risk_result["critical_nodes"]
        },
        "ai_analysis": ai_brief
    }
