import React, { useState } from 'react';
import { 
  GitCommit, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Cpu, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

export default function CorrectionTimeline({ timeline = [], isCorrected, correctionAttempts = 0 }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-dark-850/60 border border-slate-800 rounded-xl p-5 text-center">
        <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
        <p className="text-xs text-slate-400 font-medium">Self-Correction & Validation Audit Trail</p>
        <p className="text-[11px] text-slate-500 mt-1">
          When a query is submitted, the step-by-step validation and correction timeline will render here.
        </p>
      </div>
    );
  }

  const toggleExpand = (idx) => {
    setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getStepIcon = (type, status) => {
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
    switch (type) {
      case 'generation':
        return <Cpu className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'validation':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'correction':
        return <RefreshCw className="w-4 h-4 text-amber-300 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />;
      case 'revalidation':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'execution':
        return <Database className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <GitCommit className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const getStepBadgeColor = (type, status) => {
    if (status === 'failed') return 'bg-red-500/15 text-red-300 border-red-500/30';
    if (type === 'correction') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    if (status === 'success') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  };

  return (
    <div className="bg-dark-850/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Validation & Self-Correction Timeline
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isCorrected ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Corrected in {correctionAttempts} attempt{correctionAttempts > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Passed First Pass (0 retries)
            </span>
          )}
        </div>
      </div>

      {/* Vertical Timeline Steps */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {timeline.map((step, idx) => {
          const isExpanded = !!expandedSteps[idx];
          return (
            <div key={idx} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[23px] top-1 bg-dark-900 p-0.5 rounded-full border border-slate-700">
                {getStepIcon(step.type, step.status)}
              </div>

              {/* Step Card */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Step {step.step}:</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {step.title || step.type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-mono border ${getStepBadgeColor(step.type, step.status)}`}>
                      {step.status}
                    </span>
                  </div>

                  {step.sql && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 font-mono"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Message or Diagnostics */}
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {step.message}
                </p>

                {/* Error Box if failed */}
                {step.error && (
                  <div className="mt-2 p-2 rounded bg-red-950/40 border border-red-900/50 text-[11px] font-mono text-red-300">
                    ❌ {step.error}
                  </div>
                )}

                {/* SQL Accordion */}
                {step.sql && isExpanded && (
                  <div className="mt-2.5 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
                    <code>{step.sql}</code>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

