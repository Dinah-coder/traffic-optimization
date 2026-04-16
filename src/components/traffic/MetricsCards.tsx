import React from 'react';
import { Clock, Car, Activity, TrendingDown, Cpu, Radio } from 'lucide-react';

interface Props {
  avgWaitTime: number;
  vehiclesTracked: number;
  routesOptimized: number;
  timeSavedToday: number;
  modelAccuracy: number;
  activeSensors: number;
}

const MetricsCards: React.FC<Props> = ({ avgWaitTime, vehiclesTracked, routesOptimized, timeSavedToday, modelAccuracy, activeSensors }) => {
  const cards = [
    { label: 'Avg Waiting Time', value: `${avgWaitTime.toFixed(1)} min`, icon: Clock, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Vehicles Tracked', value: vehiclesTracked.toLocaleString(), icon: Car, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Routes Optimized', value: routesOptimized.toLocaleString(), icon: Activity, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
    { label: 'Time Saved Today', value: `${timeSavedToday} min`, icon: TrendingDown, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Model Accuracy', value: `${modelAccuracy}%`, icon: Cpu, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
    { label: 'Active GPS Sensors', value: activeSensors, icon: Radio, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`${c.bg} rounded-xl p-4 border border-slate-200 dark:border-slate-700`}>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{c.value}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{c.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
