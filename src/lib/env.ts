export const API_BASE = import.meta.env.VITE_API_URL ?? '';
export const MAP_TILES_URL = import.meta.env.VITE_MAP_TILES_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_TILE_ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION ?? '&copy; OpenStreetMap contributors';
export const MAP_CENTER_LAT = parseFloat(import.meta.env.VITE_MAP_CENTER_LAT ?? '-1.9440');
export const MAP_CENTER_LNG = parseFloat(import.meta.env.VITE_MAP_CENTER_LNG ?? '30.08');
export const MAP_DEFAULT_ZOOM = parseInt(import.meta.env.VITE_MAP_ZOOM ?? '12', 10);
