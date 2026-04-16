import React from 'react';
import { Activity, Github, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-8">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">KigaliFlow AI</span>
            </div>
            <p className="text-sm text-slate-400">
              Intelligent traffic flow optimization prototype for Kigali City. Built as a final-year capstone project combining civil engineering and AI.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Case Study</h4>
            <ul className="space-y-1.5 text-sm">
              <li>Kicukiro Center → Downtown CBD</li>
              <li>~9 km corridor · 12 intersections</li>
              <li>17 monitored road segments</li>
              <li>Peak-hour wait reduction: ~42%</li>
            </ul>
            <div className="flex gap-2 mt-4">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"><Mail className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"><ExternalLink className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© 2026 KigaliFlow AI · Capstone Prototype · All rights reserved</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Documentation</a>
            <a href="#" className="hover:text-white transition">Research Paper</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Licenses</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
