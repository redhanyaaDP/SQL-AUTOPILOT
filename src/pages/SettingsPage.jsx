import React, { useState, useEffect } from 'react';
import { Settings, Shield, Server, Cpu, Database, Save, Check, RefreshCw } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function SettingsPage({ backendConnected, onRefreshStatus }) {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('sql_autopilot_api_url') || 'http://localhost:8000');
  const [forceMock, setForceMock] = useState(localStorage.getItem('sql_autopilot_force_mock') === 'true');
  const [maxRetries, setMaxRetries] = useState(Number(localStorage.getItem('sql_autopilot_retries')) || 3);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('sql_autopilot_api_url', apiUrl);
    localStorage.setItem('sql_autopilot_force_mock', String(forceMock));
    localStorage.setItem('sql_autopilot_retries', String(maxRetries));
    setSaved(true);
    if (onRefreshStatus) onRefreshStatus();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-dark-850/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
          <Settings className="w-4 h-4" />
          System Configuration & Runtime Settings
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure backend connectivity, bounds for self-correction retries, and database security profiles.
        </p>
      </div>

      {/* Backend API Configuration */}
      <div className="bg-dark-850/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Server className="w-4 h-4 text-sky-400" />
            Backend API Endpoint
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-xs font-mono text-slate-400">
              {backendConnected ? 'Connected to FastAPI' : 'Using Built-in Simulation Engine'}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">FastAPI Backend URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              When Member 2 starts the FastAPI backend, SQL-AutoPilot will automatically stream queries to this address.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={forceMock}
                onChange={(e) => setForceMock(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Force Built-in Demonstration Engine</span>
            </label>
            <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
              Ideal for offline testing, presentation mode, or viva demonstration without starting a separate Python server.
            </p>
          </div>
        </div>
      </div>

      {/* Self-Correction Bounds */}
      <div className="bg-dark-850/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Cpu className="w-4 h-4 text-amber-400" />
          Self-Correction Loop Constraints
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Maximum Self-Correction Retries Limit (Bounded Recursion)
            </label>
            <select
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            >
              <option value={1}>1 Retry (Strict)</option>
              <option value={2}>2 Retries</option>
              <option value={3}>3 Retries (Recommended Standard)</option>
              <option value={5}>5 Retries (Permissive)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Prevents unbounded loops when a query contains unresolvable logical ambiguities or syntax deadlocks.
            </p>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-dark-850/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          Execution Security & Access Guardrails
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Read-Only SELECT Enforcement</div>
              <div className="text-[11px] text-slate-400">Prohibits DROP, DELETE, UPDATE, INSERT, ALTER, and multi-statement injection.</div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              ACTIVE (LOCKED)
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Query Execution Timeout</div>
              <div className="text-[11px] text-slate-400">Hard kill after 5000 ms to mitigate Cartesian-product locks.</div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              5000 MS
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

