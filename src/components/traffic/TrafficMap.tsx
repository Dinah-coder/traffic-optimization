import React from 'react';
import { NODES, EDGES, getNodeById } from '@/lib/roadNetwork';
import { TrafficData } from '@/lib/trafficSimulator';
import { RouteResult } from '@/lib/router';
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

const TrafficMap: React.FC<Props> = ({ traffic, routes, selectedRouteId, startId, endId, showHeatmap }) => {
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const routeEdgeSet = new Set(selectedRoute?.edgeIds || []);

  const routeColors: Record<string, string> = {
    r1: '#2563eb', // blue
    r2: '#8b5cf6', // violet
    r3: '#ec4899', // pink
  };

  const selectedRoutePoints = selectedRoute?.path
    ? selectedRoute.path.map(id => getNodeById(id)).filter(Boolean) as { x: number; y: number }[]
    : [];

  const renderRoutePolyline = (route: RouteResult, width: number, opacity: number, dash?: string) => {
    const points = route.path
      .map(id => getNodeById(id))
      .filter(Boolean) as { x: number; y: number }[];
    if (points.length < 2) return null;
    return (
      <polyline
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={routeColors[route.id] || '#2563eb'}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        opacity={opacity}
      />
    );
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <svg viewBox="0 0 1000 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" />
          </pattern>
          <radialGradient id="cityGlow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="700" fill="url(#grid)" />

        {/* River / decorative area */}
        <path
          d="M 0 600 Q 250 580 400 620 T 1000 600 L 1000 700 L 0 700 Z"
          fill="#bae6fd"
          opacity="0.35"
        />
        <text x="50" y="660" className="fill-sky-700" fontSize="14" fontStyle="italic">Nyabarongo River</text>

        {/* Heatmap layer */}
        {showHeatmap && EDGES.map(edge => {
          const td = traffic[edge.id];
          if (!td) return null;
          const from = getNodeById(edge.from)!;
          const to = getNodeById(edge.to)!;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const radius = 35 + (td.density / 100) * 40;
          return (
            <circle
              key={`hm-${edge.id}`}
              cx={mx}
              cy={my}
              r={radius}
              fill={congestionColor(td.density)}
              opacity={0.18}
            />
          );
        })}

        {/* Road edges colored by congestion */}
        {EDGES.map(edge => {
          const td = traffic[edge.id];
          const from = getNodeById(edge.from)!;
          const to = getNodeById(edge.to)!;
          const color = td ? congestionColor(td.density) : '#94a3b8';
          const onRoute = routeEdgeSet.has(edge.id);
          return (
            <g key={edge.id}>
              {/* Road base */}
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="#1e293b"
                strokeWidth={onRoute ? 14 : 10}
                strokeLinecap="round"
                opacity={0.25}
              />
              {/* Congestion color */}
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={color}
                strokeWidth={onRoute ? 8 : 5}
                strokeLinecap="round"
                opacity={0.9}
              />
              {/* Selected route highlight */}
              {onRoute && selectedRoute && (
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={routeColors[selectedRoute.id] || '#2563eb'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="10 6"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.2s" repeatCount="indefinite" />
                </line>
              )}
            </g>
          );
        })}

        {/* Alternate routes (faint path overlay) */}
        {routes.filter(r => r.id !== selectedRoute?.id).map(r => (
          <g key={`alt-${r.id}`}>
            {renderRoutePolyline(r, 4, 0.55, '10 8')}
          </g>
        ))}

        {/* Selected route path */}
        {selectedRoute && selectedRoute.path?.length > 1 && renderRoutePolyline(selectedRoute, 14, 0.18)}
        {selectedRoute && selectedRoute.path?.length > 1 && renderRoutePolyline(selectedRoute, 6, 0.95, '18 12')}

        {/* Route node markers */}
        {selectedRoutePoints.map((point, idx) => (
          <g key={`route-node-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={idx === 0 || idx === selectedRoutePoints.length - 1 ? 9 : 5}
              fill="#ffffff"
              stroke={routeColors[selectedRoute.id] || '#2563eb'}
              strokeWidth={3}
            />
            <text
              x={point.x}
              y={point.y + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              className="fill-slate-900 dark:fill-slate-100"
              style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 2 }}
            >
              {idx + 1}
            </text>
          </g>
        ))}

        {/* Nodes */}
        {NODES.map(node => {
          const isStart = node.id === startId;
          const isEnd = node.id === endId;
          const isKey = isStart || isEnd;
          return (
            <g key={node.id}>
              <circle
                cx={node.x} cy={node.y}
                r={isKey ? 12 : 7}
                fill={isStart ? '#10b981' : isEnd ? '#ef4444' : '#1e293b'}
                stroke="white"
                strokeWidth={2}
              />
              {isKey && (
                <circle
                  cx={node.x} cy={node.y}
                  r={18}
                  fill="none"
                  stroke={isStart ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  opacity={0.6}
                >
                  <animate attributeName="r" from="12" to="28" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={node.x}
                y={node.y - (isKey ? 20 : 14)}
                textAnchor="middle"
                fontSize={isKey ? 14 : 11}
                fontWeight={isKey ? 700 : 500}
                className="fill-slate-800 dark:fill-slate-100"
                style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 3 }}
              >
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Vehicle dots animated along selected route */}
        {selectedRoute && selectedRoute.edgeIds.map((eid, idx) => {
          const edge = EDGES.find(e => e.id === eid);
          if (!edge) return null;
          const pathIdx = selectedRoute.path.indexOf(edge.from);
          const nextIdx = selectedRoute.path.indexOf(edge.to);
          const forward = pathIdx < nextIdx;
          const fromN = forward ? getNodeById(edge.from)! : getNodeById(edge.to)!;
          const toN = forward ? getNodeById(edge.to)! : getNodeById(edge.from)!;
          return (
            <circle key={`car-${eid}`} r="4" fill="#fbbf24" stroke="white" strokeWidth="1.5">
              <animate attributeName="cx" from={fromN.x} to={toN.x} dur="3s" begin={`${idx * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="cy" from={fromN.y} to={toN.y} dur="3s" begin={`${idx * 0.4}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
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
