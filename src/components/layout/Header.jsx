import React from 'react';
import { Database, Sparkles, RefreshCw, AlertCircle, PlayCircle, ShieldCheck } from 'lucide-react';

export default function Header({ 
  activeTab, 
  onRunDemoA, 
  onRunDemoB, 
  backendConnected, 
  isExecuting 
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'System Dashboard';
      case 'generator': return 'Query Generator & Self-Correction Studio';
      case 'schema': return 'Database Schema Visualizer';
      case 'optimizer': return 'Query Optimizer & Comparison';
      case 'history': return 'Query History & Execution Audit';
      case 'settings': return 'System Configuration & API';
      default: return 'SQL-AutoPilot';
    }
  };

  return (
    <header className="h-16 bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>SQL-AutoPilot</span>
            <span>/</span>
            <span className="text-sky-400 capitalize">{activeTab}</span>
          </div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">
            {getTabTitle()}
          </h2>
        </div>
      </div>

      {/* Quick Viva Demonstration Actions */}
      <div className="flex items-center gap-3">
        {/* Demo Buttons */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={onRunDemoA}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-50"
            title="Demonstrate first-pass successful query generation and execution"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Demo A (Success)</span>
          </button>
          
          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            onClick={onRunDemoB}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-50"
            title="Demonstrate automatic detection and bounded self-correction of schema error (gpa -> cgpa)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo B (Self-Correction)</span>
          </button>
        </div>

        {/* Database Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-850 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-300 font-mono">educational_records.db</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded">2 tables</span>
        </div>
      </div>
    </header>
  );
}

