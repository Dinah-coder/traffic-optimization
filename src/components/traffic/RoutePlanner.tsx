import React from 'react';
import { NODES } from '@/lib/roadNetwork';
import { RouteResult } from '@/lib/router';
import { Navigation, Clock, Gauge, Route, TrendingDown, Zap } from 'lucide-react';

interface Props {
  startId: string;
  endId: string;
  onStartChange: (id: string) => void;
  onEndChange: (id: string) => void;
  onFindRoute: () => void;
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  peakHour: boolean;
  onPeakToggle: (v: boolean) => void;
  loading: boolean;
}

const RoutePlanner: React.FC<Props> = ({
  startId, endId, onStartChange, onEndChange, onFindRoute,
  routes, selectedRouteId, onSelectRoute, peakHour, onPeakToggle, loading
}) => {
  const optimal = routes[0];
  const worst = routes.reduce((acc, r) => (r.travelTime > (acc?.travelTime || 0) ? r : acc), routes[0]);
  const timeSaved = optimal && worst && worst.id !== optimal.id
    ? Math.round((worst.travelTime - optimal.travelTime) * 10) / 10
    : 0;

  const routeColors: Record<string, string> = {
    r1: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40',
    r2: 'border-violet-500 bg-violet-50 dark:bg-violet-950/40',
    r3: 'border-pink-500 bg-pink-50 dark:bg-pink-950/40',
  };
  const badgeColors: Record<string, string> = {
    r1: 'bg-blue-500',
    r2: 'bg-violet-500',
    r3: 'bg-pink-500',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
            <Navigation className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Route Planner</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Start Location</label>
            <select
              value={startId}
              onChange={(e) => onStartChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {NODES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Destination</label>
            <select
              value={endId}
              onChange={(e) => onEndChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {NODES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <button
            onClick={onFindRoute}
            disabled={loading || startId === endId}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Computing...
              </>
            ) : (
              <>
                <Route className="w-4 h-4" />
                Find Best Route
              </>
            )}
          </button>

          <label className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${peakHour ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Peak Hour Mode</div>
                <div className="text-xs text-slate-500">Simulate rush hour traffic</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={peakHour}
              onChange={(e) => onPeakToggle(e.target.checked)}
              className="w-10 h-5 rounded-full appearance-none bg-slate-300 checked:bg-amber-500 relative cursor-pointer transition
                before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition
                checked:before:translate-x-5"
            />
          </label>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Suggested Routes</h3>
          {timeSaved > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
              <TrendingDown className="w-3.5 h-3.5" />
              Save {timeSaved} min
            </div>
          )}
        </div>

        {routes.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-6">
            Click "Find Best Route" to compute routes
          </div>
        )}

        <div className="space-y-2">
          {routes.map((r, idx) => {
            const isSelected = r.id === selectedRouteId;
            const congLevel = r.congestionScore < 35 ? 'Free Flow' : r.congestionScore < 65 ? 'Moderate' : 'Heavy';
            const congColor = r.congestionScore < 35 ? 'text-emerald-600' : r.congestionScore < 65 ? 'text-amber-600' : 'text-red-600';
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoute(r.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  isSelected ? routeColors[r.id] : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${badgeColors[r.id]}`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{r.label}</span>
                  </div>
                  {idx === 0 && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white px-2 py-0.5 rounded">Best</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" /> Time</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{r.travelTime} min</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-500"><Route className="w-3 h-3" /> Dist</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{r.distance} km</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-500"><Gauge className="w-3 h-3" /> Speed</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{r.avgSpeed} km/h</div>
                  </div>
                </div>
                <div className={`mt-2 text-xs font-semibold ${congColor}`}>
                  Congestion: {congLevel} ({r.congestionScore}/100)
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
