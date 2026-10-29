import React, { useState } from 'react';
import { History, Play, Trash2, Clock, CheckCircle2, AlertTriangle, RefreshCw, Search } from 'lucide-react';

export default function HistoryList({ history = [], onRerun, onClearHistory }) {
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(item => 
    item.question?.toLowerCase().includes(search.toLowerCase()) ||
    item.final_sql?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-850/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <History className="w-4 h-4" />
            Query Audit Log & History
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persisted history of natural language requests, generated queries, self-corrections, and execution outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono w-48"
            />
          </div>
        </div>
      </div>

      {/* History Items */}
      {filteredHistory.length === 0 ? (
        <div className="bg-dark-850/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <History className="w-8 h-8 opacity-40 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-400">No previous query executions recorded</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Executed queries will be logged here with complete execution metrics and SQL timeline data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-dark-850/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span>"{item.question}"</span>
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.timestamp || Date.now()).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{item.execution_time_ms} ms</span>
                    <span>•</span>
                    <span>{item.row_count} rows</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'success' ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Executed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Failed
                    </span>
                  )}

                  {item.is_corrected && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Corrected ({item.correction_attempts})
                    </span>
                  )}

                  <button
                    onClick={() => onRerun(item.question)}
                    className="px-2.5 py-1 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg flex items-center gap-1 transition-colors"
                    title="Load this question into Query Generator"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Re-run</span>
                  </button>
                </div>
              </div>

              {/* SQL box */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
                <code>{item.final_sql}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

