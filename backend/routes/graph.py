import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, status

try:
    from backend.models.schemas import GraphResponse, NodeSchema, EdgeSchema
except ImportError:
    from models.schemas import GraphResponse, NodeSchema, EdgeSchema

router = APIRouter(prefix="/graph", tags=["Dependency Graph"])


def get_dependencies_file_path() -> Path:
    """Returns absolute path to backend/data/dependencies.json."""
    return Path(__file__).resolve().parent.parent / "data" / "dependencies.json"


@router.get("", response_model=GraphResponse, status_code=status.HTTP_200_OK)
@router.get("/", response_model=GraphResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def get_dependency_graph():
    """
    Returns the synthetic dependency graph consisting of nodes and directed edges.
    Loaded dynamically from backend/data/dependencies.json.
    """
    file_path = get_dependencies_file_path()

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dependency graph data file not found at expected location: {file_path}"
        )

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_nodes = data.get("nodes", [])
        raw_edges = data.get("dependencies", [])

        nodes = [
            NodeSchema(
                id=n["id"],
                label=n.get("label", ""),
                sector=n.get("sector", ""),
                criticality=n.get("criticality", 0)
            )
            for n in raw_nodes
        ]

        edges = [
            EdgeSchema(
                source=e["source"],
                target=e["target"]
            )
            for e in raw_edges
        ]

        return GraphResponse(nodes=nodes, edges=edges)

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse dependency graph JSON file: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading dependency graph data: {str(e)}"
        )
