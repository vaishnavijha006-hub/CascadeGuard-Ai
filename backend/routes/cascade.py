from fastapi import APIRouter, HTTPException, status

try:
    from backend.models.schemas import CascadeRequest, CascadeResponse
    from backend.services.cascade_engine import simulate_cascade
    from backend.services.risk_engine import calculate_risk
except ImportError:
    from models.schemas import CascadeRequest, CascadeResponse
    from services.cascade_engine import simulate_cascade
    from services.risk_engine import calculate_risk

router = APIRouter(prefix="/cascade", tags=["Cascade Simulation"])


@router.post("/simulate", response_model=CascadeResponse, status_code=status.HTTP_200_OK)
def simulate_cascade_endpoint(request: CascadeRequest):
    """
    Simulates a cascading infrastructure failure starting from `request.start_node`
    and computes the corresponding risk score and severity level.
    """
    try:
        cascade_data = simulate_cascade(request.start_node)
        risk_data = calculate_risk(request.start_node)

        return CascadeResponse(
            start_node=cascade_data["start_node"],
            affected_nodes=cascade_data["affected_nodes"],
            cascade_depth=cascade_data["cascade_depth"],
            affected_count=cascade_data["affected_count"],
            risk_score=risk_data["risk_score"],
            severity=risk_data["severity"],
            critical_nodes=risk_data["critical_nodes"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
