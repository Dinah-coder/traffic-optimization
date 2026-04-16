// Simulated GPS traffic data for each road segment
// Generates realistic speed / vehicle density values and updates them over time

import { EDGES } from './roadNetwork';

export interface TrafficData {
  edgeId: string;
  speed: number;         // current avg speed km/h
  vehicleCount: number;  // vehicles currently on segment
  density: number;       // 0-100 relative density
  flowRate: number;      // vehicles/hour
  timestamp: number;
}

export interface SimulatorOptions {
  peakHour: boolean;
}

// Deterministic pseudo-random per-edge fluctuation so markers don't jitter wildly
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function generateTrafficData(opts: SimulatorOptions = { peakHour: false }): TrafficData[] {
  const now = Date.now();
  const tick = Math.floor(now / 3000); // changes every 3s

  return EDGES.map((edge, i) => {
    // Base congestion factor per edge (some roads are always busier)
    const edgeBias = noise(i + 1);
    const timeNoise = noise(tick + i * 7);

    // Peak hour adds heavy congestion on main corridors
    const peakMultiplier = opts.peakHour ? 1.6 + edgeBias * 0.6 : 0.7 + edgeBias * 0.5;

    // Vehicle density 0-100
    const density = Math.min(100, Math.max(5, 25 * peakMultiplier + timeNoise * 30));

    // Speed decreases as density increases (Greenshields-like model)
    const speedFactor = Math.max(0.15, 1 - density / 110);
    const speed = Math.max(8, edge.baseSpeed * speedFactor + (timeNoise - 0.5) * 6);

    // Flow rate (vehicles/hour) = density * speed / distance normalization
    const flowRate = Math.round(density * speed * 0.8);

    // Vehicle count approximation for segment
    const vehicleCount = Math.round(density * edge.distance * 0.9);

    return {
      edgeId: edge.id,
      speed: Math.round(speed * 10) / 10,
      vehicleCount,
      density: Math.round(density),
      flowRate,
      timestamp: now,
    };
  });
}
