import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from 'recharts';

const peakOffPeakData = [
  { hour: '6AM', peak: 12, offPeak: 4 },
  { hour: '7AM', peak: 22, offPeak: 6 },
  { hour: '8AM', peak: 28, offPeak: 7 },
  { hour: '9AM', peak: 18, offPeak: 6 },
  { hour: '10AM', peak: 10, offPeak: 5 },
  { hour: '12PM', peak: 14, offPeak: 6 },
  { hour: '3PM', peak: 15, offPeak: 7 },
  { hour: '5PM', peak: 26, offPeak: 8 },
  { hour: '6PM', peak: 30, offPeak: 9 },
  { hour: '7PM', peak: 20, offPeak: 7 },
  { hour: '9PM', peak: 9, offPeak: 4 },
];

const waitTimeData = [
  { day: 'Mon', before: 24, after: 14 },
  { day: 'Tue', before: 26, after: 15 },
  { day: 'Wed', before: 25, after: 13 },
  { day: 'Thu', before: 27, after: 16 },
  { day: 'Fri', before: 31, after: 18 },
  { day: 'Sat', before: 18, after: 10 },
  { day: 'Sun', before: 15, after: 9 },
];

const AnalyticsCharts: React.FC<{ liveHistory: { t: number; avg: number }[] }> = ({ liveHistory }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Live Network Congestion</h3>
        <p className="text-xs text-slate-500 mb-3">Average congestion score across all segments</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={liveHistory}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="avg" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Peak vs Off-Peak Wait Times</h3>
        <p className="text-xs text-slate-500 mb-3">Average minutes lost at intersections</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={peakOffPeakData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" fontSize={10} stroke="#94a3b8" />
            <YAxis fontSize={11} stroke="#94a3b8" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="peak" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Peak Hour" />
            <Line type="monotone" dataKey="offPeak" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="Off-Peak" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Routing Impact (Weekly)</h3>
        <p className="text-xs text-slate-500 mb-3">Waiting time: before vs after AI routing</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={waitTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" fontSize={11} stroke="#94a3b8" />
            <YAxis fontSize={11} stroke="#94a3b8" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="before" fill="#f87171" name="Before AI" radius={[4, 4, 0, 0]} />
            <Bar dataKey="after" fill="#34d399" name="With AI" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
