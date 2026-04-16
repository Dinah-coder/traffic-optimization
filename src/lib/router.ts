// Intelligent routing using A* (with Dijkstra fallback)
// Edge weights are dynamically computed from predicted congestion.

import { buildGraph, getNodeById, NODES, EDGES } from './roadNetwork';
import { TrafficData } from './trafficSimulator';
import { predictCongestion } from './aiPredictor';

export interface RouteResult {
  id: string;
  path: string[];         // node ids
  edgeIds: string[];      // edge ids in traversal order
  distance: number;       // km
  travelTime: number;     // minutes
  avgSpeed: number;
  congestionScore: number; // 0-100
  label: string;
}

function haversineLike(aId: string, bId: string) {
  const a = getNodeById(aId)!;
  const b = getNodeById(bId)!;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) / 60; // approximate km
}

function edgeWeight(distance: number, baseSpeed: number, td?: TrafficData, penalty = 1) {
  const speed = td ? td.speed : baseSpeed;
  const timeHours = distance / Math.max(8, speed);
  let congestionPenalty = 1;
  if (td) {
    const p = predictCongestion({ speed: td.speed, vehicleCount: td.vehicleCount, density: td.density });
    congestionPenalty = 1 + p.score / 100;
  }
  return timeHours * 60 * congestionPenalty * penalty; // minutes
}

// A* algorithm: returns shortest path by travel time
export function aStar(
  start: string,
  goal: string,
  traffic: Record<string, TrafficData>,
  avoidEdges: Set<string> = new Set()
): string[] | null {
  const graph = buildGraph();
  const openSet = new Set<string>([start]);
  const cameFrom: Record<string, string> = {};
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  NODES.forEach(n => { gScore[n.id] = Infinity; fScore[n.id] = Infinity; });
  gScore[start] = 0;
  fScore[start] = haversineLike(start, goal);

  while (openSet.size) {
    // Node with lowest fScore
    let current = '';
    let minF = Infinity;
    openSet.forEach(n => { if (fScore[n] < minF) { minF = fScore[n]; current = n; } });
    if (current === goal) {
      const path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      return path;
    }
    openSet.delete(current);
    for (const nb of graph[current]) {
      if (avoidEdges.has(nb.edgeId)) continue;
      const w = edgeWeight(nb.distance, nb.baseSpeed, traffic[nb.edgeId]);
      const tentative = gScore[current] + w;
      if (tentative < gScore[nb.to]) {
        cameFrom[nb.to] = current;
        gScore[nb.to] = tentative;
        fScore[nb.to] = tentative + haversineLike(nb.to, goal);
        openSet.add(nb.to);
      }
    }
  }
  return null;
}

function pathToResult(
  path: string[],
  traffic: Record<string, TrafficData>,
  label: string,
  id: string
): RouteResult {
  const edgeIds: string[] = [];
  let distance = 0;
  let totalTimeMin = 0;
  let totalCongestion = 0;
  let weightedSpeedSum = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    const edge = EDGES.find(e => (e.from === a && e.to === b) || (e.from === b && e.to === a));
    if (!edge) continue;
    edgeIds.push(edge.id);
    const td = traffic[edge.id];
    const speed = td ? td.speed : edge.baseSpeed;
    distance += edge.distance;
    totalTimeMin += edgeWeight(edge.distance, edge.baseSpeed, td);
    weightedSpeedSum += speed * edge.distance;
    if (td) {
      const p = predictCongestion({ speed: td.speed, vehicleCount: td.vehicleCount, density: td.density });
      totalCongestion += p.score * edge.distance;
    }
  }

  return {
    id,
    path,
    edgeIds,
    distance: Math.round(distance * 10) / 10,
    travelTime: Math.round(totalTimeMin * 10) / 10,
    avgSpeed: Math.round(weightedSpeedSum / Math.max(0.1, distance)),
    congestionScore: Math.round(totalCongestion / Math.max(0.1, distance)),
    label,
  };
}

// Compute optimal + alternatives by penalizing edges of previous routes
export function findRoutes(
  start: string,
  goal: string,
  traffic: Record<string, TrafficData>
): RouteResult[] {
  const results: RouteResult[] = [];
  const avoid = new Set<string>();

  const optimal = aStar(start, goal, traffic);
  if (!optimal) return [];
  results.push(pathToResult(optimal, traffic, 'Optimal (AI Recommended)', 'r1'));

  // Alt 1: avoid most congested edge of optimal
  const optEdges = results[0].edgeIds;
  let worst = '';
  let worstScore = -1;
  optEdges.forEach(eid => {
    const td = traffic[eid];
    if (!td) return;
    const p = predictCongestion({ speed: td.speed, vehicleCount: td.vehicleCount, density: td.density });
    if (p.score > worstScore) { worstScore = p.score; worst = eid; }
  });
  if (worst) avoid.add(worst);
  const alt1 = aStar(start, goal, traffic, avoid);
  if (alt1 && alt1.join('|') !== optimal.join('|')) {
    results.push(pathToResult(alt1, traffic, 'Alternative Route A', 'r2'));
  }

  // Alt 2: avoid first two edges of optimal
  const avoid2 = new Set<string>(avoid);
  if (optEdges[0]) avoid2.add(optEdges[0]);
  if (optEdges[1]) avoid2.add(optEdges[1]);
  const alt2 = aStar(start, goal, traffic, avoid2);
  if (alt2) {
    const key = alt2.join('|');
    if (key !== optimal.join('|') && (!alt1 || key !== alt1.join('|'))) {
      results.push(pathToResult(alt2, traffic, 'Alternative Route B', 'r3'));
    }
  }

  return results;
}
