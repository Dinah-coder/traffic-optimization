// API client for the local FastAPI backend.
// The backend runs at http://localhost:8000 by default or via VITE_API_URL.

import { generateTrafficData, TrafficData } from '@/lib/trafficSimulator';
import { findRoutes, RouteResult } from '@/lib/router';
import { predictCongestion, Prediction } from '@/lib/aiPredictor';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface ApiStatus {
  source: 'server' | 'fallback';
  lastError?: string;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchTrafficData(peakHour: boolean): Promise<{ data: TrafficData[]; status: ApiStatus }> {
  try {
    const response = await fetch(`${API_BASE}/api/traffic-data?peak=${peakHour ? 1 : 0}`);
    const data = await parseResponse(response);
    if (!response.ok || !Array.isArray(data)) {
      throw new Error(typeof data === 'string' ? data : data?.detail || 'Unexpected response');
    }
    return { data, status: { source: 'server' } };
  } catch (err) {
    return {
      data: generateTrafficData({ peakHour }),
      status: { source: 'fallback', lastError: (err as Error).message },
    };
  }
}

export async function predictCongestionRemote(input: {
  speed: number; vehicleCount: number; density: number;
}): Promise<{ prediction: Prediction; status: ApiStatus }> {
  try {
    const response = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await parseResponse(response);
    if (!response.ok || !data?.level) {
      throw new Error(typeof data === 'string' ? data : data?.detail || 'Unexpected response');
    }
    return {
      prediction: {
        level: data.level,
        confidence: data.confidence,
        score: data.score,
      },
      status: { source: 'server' },
    };
  } catch (err) {
    return {
      prediction: predictCongestion(input),
      status: { source: 'fallback', lastError: (err as Error).message },
    };
  }
}

export async function computeRoutes(
  start: string,
  end: string,
  peakHour: boolean,
  trafficFallback: Record<string, TrafficData>
): Promise<{ routes: RouteResult[]; status: ApiStatus; timeSaved?: number }> {
  try {
    const response = await fetch(`${API_BASE}/api/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end, peak_hour: peakHour }),
    });
    const data = await parseResponse(response);
    if (!response.ok || !Array.isArray(data?.routes)) {
      throw new Error(typeof data === 'string' ? data : data?.detail || 'Unexpected response');
    }
    const routes: RouteResult[] = data.routes.map((r: any) => ({
      id: r.id,
      label: r.label,
      path: r.path,
      edgeIds: r.edgeIds,
      distance: r.distance,
      travelTime: r.travelTime,
      avgSpeed: r.avgSpeed,
      congestionScore: r.congestionScore,
    }));
    return { routes, status: { source: 'server' }, timeSaved: data.time_saved ?? data.timeSaved };
  } catch (err) {
    const routes = findRoutes(start, end, trafficFallback);
    const best = routes[0];
    const worst = routes.reduce((a, r) => r.travelTime > a.travelTime ? r : a, routes[0]);
    const timeSaved = best && worst ? Math.max(0, +(worst.travelTime - best.travelTime).toFixed(1)) : 0;
    return {
      routes,
      status: { source: 'fallback', lastError: (err as Error).message },
      timeSaved,
    };
  }
}
