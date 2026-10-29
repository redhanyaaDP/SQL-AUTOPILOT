import React from 'react';
import { Clock, Rows, RefreshCw, ShieldCheck, Activity } from 'lucide-react';

export default function ExecutionStats({ 
  executionTimeMs = 0, 
  rowCount = 0, 
  correctionAttempts = 0, 
  status = 'idle' 
}) {
  const stats = [
    {
      label: 'Execution Latency',
      value: `${executionTimeMs} ms`,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      label: 'Records Returned',
      value: rowCount,
      icon: Rows,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Correction Retries',
      value: correctionAttempts,
      icon: RefreshCw,
      color: correctionAttempts > 0 ? 'text-amber-400' : 'text-slate-400',
      bg: correctionAttempts > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-800/40 border-slate-700/40'
    },
    {
      label: 'Access Clearance',
      value: 'Read-Only (Enforced)',
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className={`p-3 rounded-xl border ${stat.bg} backdrop-blur-sm flex items-center gap-3 transition-transform hover:-translate-y-0.5`}
          >
            <div className={`p-2 rounded-lg bg-dark-900 border border-slate-800 ${stat.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                {stat.label}
              </div>
              <div className="text-sm font-bold text-slate-100 font-mono tracking-tight mt-0.5">
                {stat.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

