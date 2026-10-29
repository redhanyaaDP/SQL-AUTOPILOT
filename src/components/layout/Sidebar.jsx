import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  Database, 
  Zap, 
  History, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Layers,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, backendConnected }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers, desc: 'Central command & overview' },
    { id: 'generator', label: 'Query Generator', icon: Sparkles, desc: 'NL to SQL & self-correction' },
    { id: 'schema', label: 'Database Schema', icon: Database, desc: 'Tables, keys & relationships' },
    { id: 'optimizer', label: 'Query Optimizer', icon: Zap, desc: 'Index & plan comparison' },
    { id: 'history', label: 'Query History', icon: History, desc: 'Execution audit logs' },
    { id: 'settings', label: 'Settings & API', icon: Settings, desc: 'Endpoint & retry configs' },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-lg">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-slate-100 tracking-tight text-base flex items-center gap-1.5">
              SQL-AutoPilot
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20 font-medium">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Self-Correcting NL-SQL</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              <div className="text-left flex-1">
                <div className="leading-none">{item.label}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-dark-850/60 space-y-3">
        {/* Backend & Engine Pill */}
        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`} />
            <span className="text-slate-300 font-medium">{backendConnected ? 'Live FastAPI' : 'Built-in Engine'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">SQLite 3</span>
        </div>

        {/* Security Policy Badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Restricted Read-Only Access</span>
        </div>

        {/* Academic Project Credits */}
        <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <BookOpen className="w-3 h-3 text-sky-400" /> Team 3 Project
          </span>
          <span className="text-slate-400">DBMS & AI</span>
        </div>
      </div>
    </aside>
  );
}

