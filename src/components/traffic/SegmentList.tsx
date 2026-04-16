import React from 'react';
import { EDGES } from '@/lib/roadNetwork';
import { TrafficData } from '@/lib/trafficSimulator';

interface Props {
  traffic: Record<string, TrafficData>;
}

const congestionColor = (density: number) => {
  if (density < 35) return '#10b981';
  if (density < 70) return '#f59e0b';
  return '#ef4444';
};

const congestionLabel = (density: number) => {
  if (density < 35) return 'Free Flow';
  if (density < 70) return 'Moderate';
  return 'Congested';
};

const SegmentList: React.FC<Props> = ({ traffic }) => {
  const rows = EDGES.map(edge => {
    const td = traffic[edge.id];
    if (!td) return null;
    return { edge, td };
  }).filter(Boolean) as { edge: typeof EDGES[0]; td: TrafficData }[];

  rows.sort((a, b) => b.td.density - a.td.density);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Live Road Segments</h3>
          <p className="text-xs text-slate-500">Real-time GPS feed from {EDGES.length} segments · Updates every 3s</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 font-semibold">Road Segment</th>
              <th className="text-right py-2 font-semibold">Speed</th>
              <th className="text-right py-2 font-semibold">Vehicles</th>
              <th className="text-right py-2 font-semibold">Density</th>
              <th className="text-right py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map(({ edge, td }) => (
              <tr key={edge.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <td className="py-2.5">
                  <div className="font-medium text-slate-800 dark:text-slate-100">{edge.name}</div>
                  <div className="text-xs text-slate-500">{edge.from} → {edge.to}</div>
                </td>
                <td className="text-right font-mono text-slate-700 dark:text-slate-200">{td.speed} km/h</td>
                <td className="text-right font-mono text-slate-700 dark:text-slate-200">{td.vehicleCount}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${td.density}%`, background: congestionColor(td.density) }} />
                    </div>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 w-8">{td.density}</span>
                  </div>
                </td>
                <td className="text-right">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
                    style={{ background: congestionColor(td.density) }}
                  >
                    {congestionLabel(td.density)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SegmentList;
