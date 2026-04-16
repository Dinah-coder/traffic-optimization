// Road network data for Kicukiro Center → Downtown Kigali
// Coordinates are in a normalized SVG viewBox (0-1000 x 0-700)
// Representing key intersections and road segments in Kigali

export interface RoadNode {
  id: string;
  name: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  distance: number; // in km
  baseSpeed: number; // free-flow speed km/h
  name: string;
}

// Nodes represent major intersections/landmarks between Kicukiro and Downtown
export const NODES: RoadNode[] = [
  { id: 'kicukiro', name: 'Kicukiro Center', x: 780, y: 560, lat: -1.9865, lng: 30.1275 },
  { id: 'sonatube', name: 'Sonatube Junction', x: 700, y: 490, lat: -1.9780, lng: 30.1200 },
  { id: 'gikondo', name: 'Gikondo', x: 600, y: 520, lat: -1.9720, lng: 30.1100 },
  { id: 'magerwa', name: 'Magerwa', x: 720, y: 400, lat: -1.9650, lng: 30.1180 },
  { id: 'rwandex', name: 'Rwandex', x: 560, y: 430, lat: -1.9620, lng: 30.1050 },
  { id: 'nyabugogo', name: 'Nyabugogo', x: 340, y: 280, lat: -1.9380, lng: 30.0820 },
  { id: 'kimihurura', name: 'Kimihurura', x: 520, y: 300, lat: -1.9500, lng: 30.0980 },
  { id: 'remera', name: 'Remera', x: 680, y: 260, lat: -1.9450, lng: 30.1080 },
  { id: 'kacyiru', name: 'Kacyiru', x: 560, y: 180, lat: -1.9280, lng: 30.0920 },
  { id: 'kimironko', name: 'Kimironko', x: 780, y: 200, lat: -1.9300, lng: 30.1150 },
  { id: 'nyarugenge', name: 'Nyarugenge', x: 380, y: 400, lat: -1.9550, lng: 30.0870 },
  { id: 'downtown', name: 'Downtown (CBD)', x: 440, y: 340, lat: -1.9440, lng: 30.0590 },
];

// Edges represent road segments connecting nodes
export const EDGES: RoadEdge[] = [
  { id: 'e1', from: 'kicukiro', to: 'sonatube', distance: 1.8, baseSpeed: 50, name: 'KK 15 Rd' },
  { id: 'e2', from: 'sonatube', to: 'gikondo', distance: 1.5, baseSpeed: 45, name: 'Gikondo Rd' },
  { id: 'e3', from: 'sonatube', to: 'magerwa', distance: 2.0, baseSpeed: 60, name: 'Magerwa Rd' },
  { id: 'e4', from: 'gikondo', to: 'rwandex', distance: 1.3, baseSpeed: 40, name: 'KK 3 Ave' },
  { id: 'e5', from: 'magerwa', to: 'rwandex', distance: 2.1, baseSpeed: 55, name: 'Industrial Rd' },
  { id: 'e6', from: 'rwandex', to: 'nyarugenge', distance: 2.4, baseSpeed: 45, name: 'KN 3 Rd' },
  { id: 'e7', from: 'magerwa', to: 'remera', distance: 2.3, baseSpeed: 60, name: 'Airport Rd' },
  { id: 'e8', from: 'remera', to: 'kimihurura', distance: 2.0, baseSpeed: 50, name: 'KG 11 Ave' },
  { id: 'e9', from: 'kimihurura', to: 'downtown', distance: 1.8, baseSpeed: 45, name: 'KN 5 Rd' },
  { id: 'e10', from: 'kimihurura', to: 'kacyiru', distance: 1.9, baseSpeed: 50, name: 'KG 7 Ave' },
  { id: 'e11', from: 'kacyiru', to: 'downtown', distance: 2.2, baseSpeed: 55, name: 'KN 4 Ave' },
  { id: 'e12', from: 'nyarugenge', to: 'downtown', distance: 1.2, baseSpeed: 40, name: 'KN 2 Ave' },
  { id: 'e13', from: 'nyarugenge', to: 'nyabugogo', distance: 1.6, baseSpeed: 45, name: 'Nyabugogo Rd' },
  { id: 'e14', from: 'nyabugogo', to: 'downtown', distance: 1.5, baseSpeed: 50, name: 'KN 1 Rd' },
  { id: 'e15', from: 'remera', to: 'kimironko', distance: 2.0, baseSpeed: 55, name: 'KG 15 Ave' },
  { id: 'e16', from: 'kimironko', to: 'kacyiru', distance: 2.5, baseSpeed: 50, name: 'Ring Rd' },
  { id: 'e17', from: 'rwandex', to: 'kimihurura', distance: 2.2, baseSpeed: 45, name: 'KN 9 Rd' },
];

export const getNodeById = (id: string) => NODES.find(n => n.id === id);
export const getEdgeKey = (a: string, b: string) => [a, b].sort().join('-');

// Build adjacency list for routing
export function buildGraph() {
  const graph: Record<string, { to: string; edgeId: string; distance: number; baseSpeed: number }[]> = {};
  NODES.forEach(n => { graph[n.id] = []; });
  EDGES.forEach(e => {
    graph[e.from].push({ to: e.to, edgeId: e.id, distance: e.distance, baseSpeed: e.baseSpeed });
    graph[e.to].push({ to: e.from, edgeId: e.id, distance: e.distance, baseSpeed: e.baseSpeed });
  });
  return graph;
}
