import json
from collections import deque
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import networkx as nx


def load_dependency_graph(file_path: Optional[Union[str, Path]] = None) -> nx.DiGraph:
    """
    Loads the synthetic dependency graph from dependencies.json into a directed NetworkX graph.

    Each node is populated with metadata attributes (label, sector, criticality).
    Directed edges represent downstream failure dependencies (source -> target).
    """
    if file_path is None:
        file_path = Path(__file__).resolve().parent.parent / "data" / "dependencies.json"
    else:
        file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(f"Dependency graph file not found at: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    graph = nx.DiGraph()

    # Add nodes with metadata attributes
    for node in data.get("nodes", []):
        graph.add_node(
            node["id"],
            label=node.get("label", ""),
            sector=node.get("sector", ""),
            criticality=node.get("criticality", 0)
        )

    # Add directed edges representing downstream dependency propagation
    for edge in data.get("dependencies", []):
        graph.add_edge(edge["source"], edge["target"])

    return graph


def simulate_cascade(
    start_node: str,
    graph: Optional[nx.DiGraph] = None,
    file_path: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Simulates a failure cascade starting from `start_node` using Breadth-First Search (BFS).

    Algorithm Steps:
    1. Verify that `start_node` exists in the graph.
    2. Initialize BFS queue starting with `(start_node, depth=0)`.
    3. Traverse downstream dependencies (out-edges) level by level.
    4. Record propagation order and track maximum cascade depth.
    5. Return total affected count, depth, propagation order, and origin node.

    Parameters:
        start_node (str): ID of the initial failing node.
        graph (nx.DiGraph, optional): Pre-loaded NetworkX directed graph.
        file_path (str | Path, optional): Path to dependencies.json if graph is not passed.

    Returns:
        Dict[str, Any]: Dictionary containing start_node, affected_nodes, cascade_depth, and affected_count.
    """
    if graph is None:
        graph = load_dependency_graph(file_path)

    # 1. Verify start node exists in the dependency graph
    if not graph.has_node(start_node):
        raise ValueError(f"Start node '{start_node}' not found in dependency graph.")

    # 2. Initialize traversal data structures
    visited = set()
    queue = deque([(start_node, 0)])
    affected_nodes: List[str] = []
    max_depth = 0

    # 3. BFS traversal to compute downstream cascade propagation
    while queue:
        current, depth = queue.popleft()
        if current in visited:
            continue

        visited.add(current)
        affected_nodes.append(current)

        if depth > max_depth:
            max_depth = depth

        # Sort successors to ensure 100% deterministic traversal order
        for successor in sorted(graph.successors(current)):
            if successor not in visited:
                queue.append((successor, depth + 1))

    # 4. Return results dictionary matching required structure
    return {
        "start_node": start_node,
        "affected_nodes": affected_nodes,
        "cascade_depth": max_depth,
        "affected_count": len(affected_nodes)
    }


if __name__ == "__main__":
    # Quick self-test demonstration
    test_result = simulate_cascade("sldc")
    print("Cascade simulation for 'sldc':")
    print(json.dumps(test_result, indent=2))
