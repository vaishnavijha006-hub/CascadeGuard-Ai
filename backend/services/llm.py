import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from pydantic import ValidationError

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

try:
    from groq import Groq, GroqError
except ImportError:
    Groq = None
    GroqError = Exception

try:
    from backend.models.schemas import IncidentBrief
except ImportError:
    from models.schemas import IncidentBrief

# Load environment variables
load_dotenv()

# Candidate Groq models (Primary: llama-3.3-70b-versatile, followed by active fallbacks)
MODEL_CANDIDATES = [
    "llama-3.3-70b-versatile",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "groq/compound"
]

SYSTEM_PROMPT = """
You are CascadeGuard AI, an expert incident response intelligence assistant for critical infrastructure defense.
Your objective is to interpret deterministic cascade and risk results from the CascadeGuard engine and produce an executive responder brief in valid json format.

CRITICAL CONSTRAINTS:
1. AUTHORITATIVE BACKEND VALUES: Never recalculate, change, or override the risk score, severity, affected nodes, cascade depth, or critical nodes provided by the engine.
2. NO REAL-WORLD CLAIMS: Treat this analysis strictly as a SIMULATED DEMO SCENARIO. Do not claim or imply that an actual real-world emergency is occurring.
3. NO FABRICATION: Do not invent real-world infrastructure locations, secret PII, or facts outside the provided synthetic data.
4. PRACTICALITY: Provide clear, structured, actionable recommendations tailored for emergency infrastructure responders. Use priority levels HIGH, MEDIUM, or LOW for priority_actions.
5. STRICT JSON OUTPUT: Return ONLY a valid JSON object matching the requested schema.
"""


def _generate_fallback_brief(
    incident_type: str,
    incident_description: str,
    cascade_result: Dict[str, Any],
    risk_result: Dict[str, Any],
    error_reason: str
) -> Dict[str, Any]:
    """
    Generates a deterministic fallback brief when the Groq API key is missing or API call fails.
    """
    start_node = cascade_result.get("start_node", "Unknown")
    affected_count = cascade_result.get("affected_count", 0)
    severity = risk_result.get("severity", "UNKNOWN")
    risk_score = risk_result.get("risk_score", 0)
    critical_nodes = risk_result.get("critical_nodes", [])

    fallback = IncidentBrief(
        summary=f"[SIMULATION DEMO BRIEF] A simulated {incident_type} initiated at node '{start_node}' causing a cascade across {affected_count} system node(s) with risk score {risk_score} ({severity}).",
        key_impacts=[
            f"Origin failure at node '{start_node}': {incident_description}",
            f"Downstream cascade affecting {affected_count} node(s) with max depth of {cascade_result.get('cascade_depth', 0)}",
            f"High-criticality (Level 5) affected nodes: {', '.join(critical_nodes) if critical_nodes else 'None'}"
        ],
        priority_actions=[
            {
                "priority": "HIGH",
                "action": f"Isolate origin node '{start_node}' and switch to redundant backup systems.",
                "reason": f"Node '{start_node}' is the origin of the cascading failure."
            },
            {
                "priority": "MEDIUM",
                "action": f"Deploy emergency contingency protocols for critical nodes: {', '.join(critical_nodes) if critical_nodes else 'All affected nodes'}.",
                "reason": "Prevent secondary infrastructure power/service drops."
            }
        ],
        responder_note=f"Notice: Generated via deterministic engine fallback brief ({error_reason}). Context is 100% simulated demo data."
    )
    return fallback.model_dump()


def generate_incident_brief(
    incident_type: str,
    incident_description: str,
    cascade_result: Dict[str, Any],
    risk_result: Dict[str, Any],
    allow_fallback: bool = False
) -> Dict[str, Any]:
    """
    Interprets deterministic CascadeGuard simulation & risk results using Groq LLM API
    to produce a structured, validated Incident Brief.

    Parameters:
        incident_type (str): Type of incident (e.g., 'Power Outage', 'Cyber Attack').
        incident_description (str): Narrative description of the initial event.
        cascade_result (dict): Output from `simulate_cascade()`.
        risk_result (dict): Output from `calculate_risk()`.
        allow_fallback (bool): If True, returns a fallback brief on LLM API failure instead of raising an exception.

    Returns:
        dict: Validated JSON dictionary matching IncidentBrief schema.
    """
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        error_msg = "GROQ_API_KEY environment variable is not set."
        if allow_fallback:
            return _generate_fallback_brief(incident_type, incident_description, cascade_result, risk_result, error_msg)
        raise ValueError(error_msg)

    if Groq is None:
        error_msg = "groq package is not installed."
        if allow_fallback:
            return _generate_fallback_brief(incident_type, incident_description, cascade_result, risk_result, error_msg)
        raise RuntimeError(error_msg)

    user_prompt = f"""
Simulated Incident Scenario:
- Incident Type: {incident_type}
- Incident Description: {incident_description}

Authoritative Backend Cascade Simulation Results:
- Origin Node (Start): {cascade_result.get('start_node')}
- Affected Nodes: {cascade_result.get('affected_nodes')}
- Total Affected Count: {cascade_result.get('affected_count')}
- Cascade Depth: {cascade_result.get('cascade_depth')}

Authoritative Backend Risk Assessment Results:
- Risk Score: {risk_result.get('risk_score')} / 100
- Severity Level: {risk_result.get('severity')}
- Critical Level-5 Nodes Affected: {risk_result.get('critical_nodes')}

Respond with a json object containing:
- summary (string)
- key_impacts (list of strings)
- priority_actions (list of objects with priority, action, reason; priority MUST be 'HIGH', 'MEDIUM', or 'LOW')
- responder_note (string)
"""

    client = Groq(api_key=api_key)
    last_error = None

    for model_name in MODEL_CANDIDATES:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                timeout=20.0
            )

            raw_content = response.choices[0].message.content
            if not raw_content:
                continue

            clean_content = raw_content.strip()
            if "```json" in clean_content:
                clean_content = clean_content.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_content:
                clean_content = clean_content.split("```")[1].split("```")[0].strip()

            parsed_json = json.loads(clean_content)
            validated_brief = IncidentBrief(**parsed_json)
            return validated_brief.model_dump()

        except (GroqError, ValidationError, json.JSONDecodeError, ValueError, Exception) as err:
            last_error = err
            continue

    if allow_fallback:
        return _generate_fallback_brief(
            incident_type,
            incident_description,
            cascade_result,
            risk_result,
            error_reason=f"LLM API or validation error: {str(last_error)}"
        )

    raise RuntimeError(f"Groq API call failed: {str(last_error)}")


if __name__ == "__main__":
    sample_cascade = {
        "start_node": "hospital",
        "affected_nodes": ["hospital", "emergency", "ambulance"],
        "cascade_depth": 2,
        "affected_count": 3
    }
    sample_risk = {
        "start_node": "hospital",
        "risk_score": 45,
        "severity": "MEDIUM",
        "affected_count": 3,
        "cascade_depth": 2,
        "critical_nodes": ["hospital", "emergency"]
    }

    brief = generate_incident_brief(
        incident_type="Power Failure",
        incident_description="Main feeder trip at hospital substations",
        cascade_result=sample_cascade,
        risk_result=sample_risk,
        allow_fallback=True
    )

    print("Generated Incident Brief:")
    print(json.dumps(brief, indent=2))
