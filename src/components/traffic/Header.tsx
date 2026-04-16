import React from 'react';
import { Activity, Github, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Props {
  peakHour: boolean;
}

const Header: React.FC<Props> = ({ peakHour }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl leading-tight">KigaliFlow AI</h1>
              <p className="text-xs text-emerald-100">Intelligent Traffic Routing · Kicukiro ↔ Downtown</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#dashboard" className="hover:text-emerald-200 transition">Dashboard</a>
            <a href="#planner" className="hover:text-emerald-200 transition">Route Planner</a>
            <a href="#analytics" className="hover:text-emerald-200 transition">Analytics</a>
            <a href="#docs" className="hover:text-emerald-200 transition">Backend API</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur ${
              peakHour ? 'bg-amber-500/90' : 'bg-emerald-500/90'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {peakHour ? 'PEAK HOUR MODE' : 'NORMAL TRAFFIC'}
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a
              href="#docs"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
