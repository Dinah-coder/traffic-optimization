import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { NODES, EDGES, getNodeById } from '@/lib/roadNetwork';
import { TrafficData } from '@/lib/trafficSimulator';
import { RouteResult } from '@/lib/router';
import { MAP_TILES_URL, MAP_TILE_ATTRIBUTION, MAP_CENTER_LAT, MAP_CENTER_LNG, MAP_DEFAULT_ZOOM } from '@/lib/env';
import { MapPin, Flag } from 'lucide-react';

interface Props {
  traffic: Record<string, TrafficData>;
  routes: RouteResult[];
  selectedRouteId: string | null;
  startId: string;
  endId: string;
  showHeatmap: boolean;
}

const congestionColor = (density: number) => {
  if (density < 35) return '#10b981';
  if (density < 70) return '#f59e0b';
  return '#ef4444';
};

const getLatLng = (node: { lat: number; lng: number }) => [node.lat, node.lng] as [number, number];

const TrafficMap: React.FC<Props> = ({ traffic, routes, selectedRouteId, startId, endId, showHeatmap }) => {
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const routeEdgeSet = new Set(selectedRoute?.edgeIds || []);

  const routeColors: Record<string, string> = {
    r1: '#2563eb',
    r2: '#8b5cf6',
    r3: '#ec4899',
  };

  const edgesWithCoords = useMemo(() => {
    return EDGES.map(edge => {
      const from = getNodeById(edge.from);
      const to = getNodeById(edge.to);
      return from && to ? { edge, from, to, traffic: traffic[edge.id] } : null;
    }).filter(Boolean) as Array<{ edge: typeof EDGES[number]; from: { lat: number; lng: number }; to: { lat: number; lng: number }; traffic?: TrafficData }>;
  }, [traffic]);

  const selectedRoutePoints = selectedRoute?.path
    ? selectedRoute.path.map(id => getNodeById(id)).filter(Boolean).map(getLatLng)
    : [];

  const altRoutes = routes.filter(r => r.id !== selectedRoute?.id);
  const startNode = getNodeById(startId);
  const endNode = getNodeById(endId);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <MapContainer
        center={[MAP_CENTER_LAT, MAP_CENTER_LNG]}
        zoom={MAP_DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer url={MAP_TILES_URL} attribution={MAP_TILE_ATTRIBUTION} />

        {edgesWithCoords.map(({ edge, from, to, traffic: td }) => {
          const onRoute = routeEdgeSet.has(edge.id);
          const color = td ? congestionColor(td.density) : '#94a3b8';
          return (
            <React.Fragment key={edge.id}>
              <Polyline
                positions={[getLatLng(from), getLatLng(to)]}
                pathOptions={{ color: '#1e293b', weight: onRoute ? 12 : 8, opacity: 0.18 }}
              />
              <Polyline
                positions={[getLatLng(from), getLatLng(to)]}
                pathOptions={{ color, weight: onRoute ? 6 : 4, opacity: 0.9 }}
              />
            </React.Fragment>
          );
        })}

        {showHeatmap && edgesWithCoords.map(({ edge, from, to, traffic: td }) => {
          if (!td) return null;
          const midLat = (from.lat + to.lat) / 2;
          const midLng = (from.lng + to.lng) / 2;
          return (
            <CircleMarker
              key={`hm-${edge.id}`}
              center={[midLat, midLng]}
              radius={10 + td.density / 12}
              pathOptions={{ color: congestionColor(td.density), fillColor: congestionColor(td.density), fillOpacity: 0.18, weight: 0 }}
            />
          );
        })}

        {altRoutes.map(route => {
          const points = route.path.map(id => getNodeById(id)).filter(Boolean).map(getLatLng);
          return points.length > 1 ? (
            <Polyline
              key={`alt-${route.id}`}
              positions={points}
              pathOptions={{ color: '#64748b', weight: 4, opacity: 0.35, dashArray: '10 8' }}
            />
          ) : null;
        })}

        {selectedRoute && selectedRoutePoints.length > 1 && (
          <Polyline
            positions={selectedRoutePoints}
            pathOptions={{ color: routeColors[selectedRoute.id] || '#2563eb', weight: 8, opacity: 0.95, dashArray: '18 12' }}
          />
        )}

        {NODES.map(node => {
          const isStart = node.id === startId;
          const isEnd = node.id === endId;
          const isKey = isStart || isEnd;
          return (
            <CircleMarker
              key={node.id}
              center={getLatLng(node)}
              radius={isKey ? 10 : 6}
              pathOptions={{ color: isStart ? '#10b981' : isEnd ? '#ef4444' : '#0f172a', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <span>{node.name}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {startNode && (
          <CircleMarker center={getLatLng(startNode)} radius={0} pathOptions={{ opacity: 0 }} />
        )}
        {endNode && (
          <CircleMarker center={getLatLng(endNode)} radius={0} pathOptions={{ opacity: 0 }} />
        )}
      </MapContainer>

      <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-lg p-3 text-xs shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Congestion Level</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-1.5 rounded" style={{ background: '#10b981' }} /> Free Flow</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-4 h-1.5 rounded" style={{ background: '#f59e0b' }} /> Moderate</div>
        <div className="flex items-center gap-2"><span className="w-4 h-1.5 rounded" style={{ background: '#ef4444' }} /> Congested</div>
      </div>

      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-lg px-3 py-2 text-xs shadow-lg border border-slate-200 dark:border-slate-700 flex gap-3">
        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Start</div>
        <div className="flex items-center gap-1.5"><Flag className="w-3.5 h-3.5 text-red-500" /> Destination</div>
      </div>
    </div>
  );
};

export default TrafficMap;
