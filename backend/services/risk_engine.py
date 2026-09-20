import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import networkx as nx

# Ensure services directory is in sys.path
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

try:
    from cascade_engine import simulate_cascade, load_dependency_graph
except ImportError:
    try:
        from services.cascade_engine import simulate_cascade, load_dependency_graph
    except ImportError:
        from backend.services.cascade_engine import simulate_cascade, load_dependency_graph



def determine_severity(risk_score: float) -> str:
    """
    Categorizes numerical risk score into a severity tier.
    - 0 to 29: LOW
    - 30 to 59: MEDIUM
    - 60 to 79: HIGH
    - 80 to 100: CRITICAL
    """
    if risk_score >= 80.0:
        return "CRITICAL"
    elif risk_score >= 60.0:
        return "HIGH"
    elif risk_score >= 30.0:
        return "MEDIUM"
    else:
        return "LOW"


def calculate_risk(
    start_node: str,
    graph: Optional[nx.DiGraph] = None
) -> Dict[str, Any]:
    """
    Calculates a deterministic risk score (0-100) for a failure originating at `start_node`.

    Formula Logic (Transparent & Deterministic):
    -------------------------------------------
    The Risk Score combines three weighted components:
    1. Affected Criticality Weight (50%):
       Ratio of the sum of criticalities of affected nodes to the total graph criticality sum.
    2. Infrastructure Impact Breadth (30%):
       Ratio of affected node count to total node count in the infrastructure.
    3. Cascade Depth Weight (20%):
       Normalized propagation depth (clamped against a reference max depth of 4 levels).

    Formula:
      Risk Score = round( (0.50 * (affected_crit_sum / total_crit_sum) +
                           0.30 * (affected_count / total_nodes) +
                           0.20 * min(cascade_depth / 4.0, 1.0)) * 100 )

    Parameters:
        start_node (str): ID of the initial failing node.
        graph (nx.DiGraph, optional): Pre-loaded NetworkX directed graph.

    Returns:
        Dict[str, Any]: Dictionary matching required schema with risk score, severity, and critical nodes.
    """
    if graph is None:
        graph = load_dependency_graph()

    # 1. Run cascade simulation to get affected nodes and depth
    cascade_result = simulate_cascade(start_node, graph=graph)
    affected_nodes: List[str] = cascade_result["affected_nodes"]
    cascade_depth: int = cascade_result["cascade_depth"]
    affected_count: int = cascade_result["affected_count"]

    total_nodes_count = graph.number_of_nodes()
    if total_nodes_count == 0:
        raise ValueError("Dependency graph contains no nodes.")

    # 2. Compute total graph criticality and affected nodes criticality
    total_criticality_sum = sum(
        graph.nodes[node].get("criticality", 0) for node in graph.nodes
    )
    affected_criticality_sum = sum(
        graph.nodes[node].get("criticality", 0) for node in affected_nodes
    )

    # 3. Identify high-criticality nodes (criticality == 5) among affected nodes
    critical_nodes = [
        node for node in affected_nodes
        if graph.nodes[node].get("criticality", 0) == 5
    ]

    # 4. Apply deterministic formula (guaranteed 0 to 100)
    crit_ratio = affected_criticality_sum / total_criticality_sum if total_criticality_sum > 0 else 0.0
    count_ratio = affected_count / total_nodes_count
    depth_ratio = min(cascade_depth / 4.0, 1.0)

    raw_score = (0.50 * crit_ratio + 0.30 * count_ratio + 0.20 * depth_ratio) * 100.0
    risk_score = min(max(round(raw_score), 0), 100)  # Clamp between 0 and 100

    severity = determine_severity(risk_score)

    return {
        "start_node": start_node,
        "risk_score": risk_score,
        "severity": severity,
        "affected_count": affected_count,
        "cascade_depth": cascade_depth,
        "critical_nodes": critical_nodes
    }


if __name__ == "__main__":
    import json
    print("Risk calculation for all synthetic nodes:")
    graph = load_dependency_graph()
    for node in sorted(graph.nodes):
        result = calculate_risk(node, graph=graph)
        print(f"Node '{node:12}': Score = {result['risk_score']:3} | Severity = {result['severity']:8} | Critical Nodes = {result['critical_nodes']}")
