import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './traffic/Header';
import Footer from './traffic/Footer';
import TrafficMap from './traffic/TrafficMap';
import RoutePlanner from './traffic/RoutePlanner';
import MetricsCards from './traffic/MetricsCards';
import AnalyticsCharts from './traffic/AnalyticsCharts';
import SegmentList from './traffic/SegmentList';
import { TrafficData } from '@/lib/trafficSimulator';
import { RouteResult } from '@/lib/router';
import { EDGES } from '@/lib/roadNetwork';
import { fetchTrafficData, computeRoutes, ApiStatus } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Layers, Eye, EyeOff, Cloud, CloudOff } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [peakHour, setPeakHour] = useState(false);
  const [traffic, setTraffic] = useState<Record<string, TrafficData>>({});
  const [startId, setStartId] = useState('kicukiro');
  const [endId, setEndId] = useState('downtown');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [liveHistory, setLiveHistory] = useState<{ t: number; avg: number }[]>([]);
  const [routesOptimized, setRoutesOptimized] = useState(1842);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ source: 'server' });

  // Simulate GPS data updates every 3 seconds via edge function
  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      const { data, status } = await fetchTrafficData(peakHour);
      if (cancelled) return;
      setApiStatus(status);
      const map: Record<string, TrafficData> = {};
      data.forEach(d => { map[d.edgeId] = d; });
      setTraffic(map);

      const avgScore = data.reduce((acc, d) => {
        return acc + (d.density * 0.8 + Math.max(0, 60 - d.speed) * 0.2);
      }, 0) / Math.max(1, data.length);
      setLiveHistory(prev => {
        const next = [...prev, { t: Date.now(), avg: Math.round(avgScore) }];
        return next.slice(-20);
      });
    };
    update();
    const id = setInterval(update, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [peakHour]);

  // Live route re-computation (uses backend) with throttling
  const lastRouteKey = useRef<string>('');
  const recomputeTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!Object.keys(traffic).length || !routes.length) return;
    const key = `${startId}-${endId}`;
    if (key !== lastRouteKey.current) return;
    if (recomputeTimer.current) window.clearTimeout(recomputeTimer.current);
    recomputeTimer.current = window.setTimeout(async () => {
      const { routes: next } = await computeRoutes(startId, endId, peakHour, traffic);
      if (next.length) setRoutes(next);
    }, 500);
  }, [traffic, startId, endId, routes.length, peakHour]);

  const handleFindRoute = useCallback(async () => {
    if (startId === endId) {
      toast.error('Start and destination must differ');
      return;
    }
    setLoading(true);
    const { routes: result, status, timeSaved } = await computeRoutes(startId, endId, peakHour, traffic);
    setApiStatus(status);
    if (!result.length) {
      toast.error('No route found between selected points');
      setLoading(false);
      return;
    }
    setRoutes(result);
    setSelectedRouteId(result[0].id);
    lastRouteKey.current = `${startId}-${endId}`;
    setRoutesOptimized(r => r + 1);

    const sourceTag = status.source === 'server' ? ' (via A* API)' : ' (offline fallback)';
    toast.success(
      (timeSaved || 0) > 0
        ? `Optimal route found${sourceTag} · Saves ${timeSaved} min`
        : `Optimal route computed${sourceTag}`
    );
    setLoading(false);
  }, [startId, endId, traffic, peakHour]);

  // Initial route calculation once traffic is loaded
  useEffect(() => {
    if (Object.keys(traffic).length && !routes.length) {
      (async () => {
        const { routes: result } = await computeRoutes(startId, endId, peakHour, traffic);
        if (result.length) {
          setRoutes(result);
          setSelectedRouteId(result[0].id);
          lastRouteKey.current = `${startId}-${endId}`;
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traffic]);

  const metrics = useMemo(() => {
    const totalVehicles = Object.values(traffic).reduce((acc, t) => acc + t.vehicleCount, 0);
    const avgCongestionScore = Object.values(traffic).length
      ? Object.values(traffic).reduce((a, t) => {
          return a + (t.density * 0.8 + Math.max(0, 60 - t.speed) * 0.2);
        }, 0) / Object.values(traffic).length
      : 0;
    const avgWait = 6 + (avgCongestionScore / 100) * 22;
    return {
      avgWaitTime: avgWait,
      vehiclesTracked: totalVehicles * 47,
      routesOptimized,
      timeSavedToday: 312 + Math.floor(routesOptimized / 10),
      modelAccuracy: 87.4,
      activeSensors: EDGES.length * 3,
    };
  }, [traffic, routesOptimized]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header peakHour={peakHour} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6 space-y-6">
        <section id="dashboard" className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 md:p-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  LIVE TRAFFIC DASHBOARD
                </span>
                <span
                  title={apiStatus.lastError || 'Connected to backend'}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    apiStatus.source === 'server'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                      : 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                  }`}
                >
                  {apiStatus.source === 'server' ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                  {apiStatus.source === 'server' ? 'API Connected' : 'Offline Simulator'}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Kicukiro Center → Downtown Kigali</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Real-time GPS simulation and A* route optimization powered by a FastAPI backend.
              </p>
            </div>
          </div>
          <MetricsCards {...metrics} />
        </section>

        <section id="planner" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Live Traffic Map</h3>
              <button
                onClick={() => setShowHeatmap(h => !h)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
              >
                {showHeatmap ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showHeatmap ? 'Hide' : 'Show'} Heatmap
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="h-[520px]">
              <TrafficMap
                traffic={traffic}
                routes={routes}
                selectedRouteId={selectedRouteId}
                startId={startId}
                endId={endId}
                showHeatmap={showHeatmap}
              />
            </div>
          </div>
          <div>
            <RoutePlanner
              startId={startId}
              endId={endId}
              onStartChange={setStartId}
              onEndChange={setEndId}
              onFindRoute={handleFindRoute}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
              peakHour={peakHour}
              onPeakToggle={setPeakHour}
              loading={loading}
            />
          </div>
        </section>

        <section id="analytics">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">Traffic Analytics</h3>
              <p className="text-sm text-slate-500">AI-powered insights across time-of-day and weekly patterns</p>
            </div>
          </div>
          <AnalyticsCharts liveHistory={liveHistory} />
        </section>

        <section>
          <SegmentList traffic={traffic} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;
