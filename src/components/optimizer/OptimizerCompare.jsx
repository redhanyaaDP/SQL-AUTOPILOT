import React, { useState } from 'react';
import { Zap, Clock, ArrowRight, CheckCircle2, TrendingUp, Layers, AlertCircle, Play } from 'lucide-react';
import { compareOptimizedQuery } from '../../services/api';

export default function OptimizerCompare() {
  const [selectedSql, setSelectedSql] = useState("SELECT * FROM students WHERE cgpa > 8.5 ORDER BY cgpa DESC;");
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleQueries = [
    { label: "Filtering on CGPA", sql: "SELECT student_id, name, cgpa FROM students WHERE cgpa > 8.5;" },
    { label: "Join Departments & Students", sql: "SELECT s.name, d.department_name FROM students s JOIN departments d ON s.department_id = d.department_id;" },
    { label: "Department Aggregate Grouping", sql: "SELECT department_id, AVG(cgpa) FROM students GROUP BY department_id;" }
  ];

  const runBenchmark = async () => {
    setIsAnalyzing(true);
    try {
      const res = await compareOptimizedQuery(selectedSql);
      setBenchmarkResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-dark-850/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
          <Zap className="w-4 h-4" />
          SQL Optimization & Execution Plan Comparison
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Compares naive candidate queries with index-assisted query formulations, evaluating execution plans, estimated costs, and measured latency.
        </p>

        {/* Query selection */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="text-[11px] font-medium text-slate-400">Select Benchmark Query:</div>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSql(q.sql);
                  setBenchmarkResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  selectedSql === q.sql 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={selectedSql}
              onChange={(e) => setSelectedSql(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={runBenchmark}
              disabled={isAnalyzing}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Profiling Plan...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Compare Plans</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Results */}
      {benchmarkResult && (
        <div className="space-y-6">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-850 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Original Baseline</div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">{benchmarkResult.original_time_ms} ms</div>
              <div className="text-[11px] text-slate-400 mt-1">Full Sequential Scan</div>
            </div>

            <div className="p-4 bg-dark-850 border border-emerald-500/30 rounded-xl shadow-lg shadow-emerald-500/5">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono">Optimized Plan</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{benchmarkResult.optimized_time_ms} ms</div>
              <div className="text-[11px] text-emerald-400/80 mt-1">Index-Assisted Seek</div>
            </div>

            <div className="p-4 bg-dark-850 border border-sky-500/30 rounded-xl shadow-lg shadow-sky-500/5">
              <div className="text-[10px] uppercase tracking-wider text-sky-400 font-mono">Net Speedup</div>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" />
                +{benchmarkResult.speedup_percentage}% Faster
              </div>
              <div className="text-[11px] text-sky-400/80 mt-1">Plan cost reduction</div>
            </div>
          </div>

          {/* Side by Side Query Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-850 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-semibold uppercase text-slate-400 font-mono">Original SQL</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Baseline</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                <code>{benchmarkResult.original_sql}</code>
              </div>
            </div>

            <div className="bg-dark-850 border border-emerald-500/30 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-semibold uppercase text-emerald-400 font-mono">Optimized Query Form</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Optimized</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/20 font-mono text-xs text-emerald-300">
                <code>{benchmarkResult.optimized_sql}</code>
              </div>
            </div>
          </div>

          {/* Optimizer Explanation */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100">Optimization Diagnostic Insight:</div>
              <div className="text-slate-400 mt-1 leading-relaxed">{benchmarkResult.explanation}</div>
            </div>
          </div>

          {/* Plan Comparison Table */}
          <div className="bg-dark-850 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Execution Plan Operator Comparison
            </h4>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2.5">Plan Metric</th>
                  <th className="pb-2.5">Original Plan</th>
                  <th className="pb-2.5 text-emerald-400">Optimized Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {benchmarkResult.plan_comparison.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-semibold text-slate-400">{item.step}</td>
                    <td className="py-2.5 text-slate-400">{item.original}</td>
                    <td className="py-2.5 text-emerald-300 font-semibold">{item.optimized}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

