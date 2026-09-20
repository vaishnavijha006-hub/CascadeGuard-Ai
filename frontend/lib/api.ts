import type {
  ApiGraphResponse,
  IncidentRequest,
  IncidentAnalyzeResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Fetches the complete dependency graph from the backend.
 * Endpoint: GET /api/graph
 */
export async function getGraph(): Promise<ApiGraphResponse> {
  const url = `${API_BASE_URL}/api/graph`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${res.status}: Failed to load graph`);
    }

    return (await res.json()) as ApiGraphResponse;
  } catch (err: any) {
    if (err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
      throw new Error('Unable to connect to CascadeGuard backend. Make sure the backend is running.');
    }
    throw err;
  }
}

/**
 * Sends an incident scenario to the backend for cascade simulation, risk scoring, and AI analysis.
 * Endpoint: POST /api/incident/analyze
 */
export async function analyzeIncident(
  request: IncidentRequest
): Promise<IncidentAnalyzeResponse> {
  const url = `${API_BASE_URL}/api/incident/analyze`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid starting node or parameters.');
      }
      if (res.status === 422) {
        throw new Error('Please complete all required incident fields.');
      }
      if (res.status === 503) {
        throw new Error('AI analysis service is temporarily unavailable. Please try again.');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error (${res.status}).`);
    }

    return (await res.json()) as IncidentAnalyzeResponse;
  } catch (err: any) {
    if (err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
      throw new Error('Unable to connect to CascadeGuard backend. Make sure the backend is running.');
    }
    throw err;
  }
}
