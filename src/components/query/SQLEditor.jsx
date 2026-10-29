import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Edit3, Play, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SQLEditor({ 
  sql, 
  generatedSql,
  isCorrected, 
  status, 
  error,
  onRunEditedSql,
  isExecuting 
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(sql || '');

  useEffect(() => {
    setEditedCode(sql || '');
    setIsEditing(false);
  }, [sql]);

  const handleCopy = () => {
    if (!sql) return;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunEdit = () => {
    if (!editedCode.trim()) return;
    onRunEditedSql(editedCode);
  };

  const getStatusBadge = () => {
    if (status === 'error') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Validation Failed
        </span>
      );
    }
    if (isCorrected) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Auto-Corrected & Validated
        </span>
      );
    }
    if (sql) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Validated & Approved
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-dark-850/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Editor Header Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            SQL Editor & Inspector
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            SQLite Dialect
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          {/* Copy Button */}
          {sql && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors text-xs flex items-center gap-1"
              title="Copy SQL to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {/* Edit Toggle */}
          {sql && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-md transition-colors text-xs flex items-center gap-1 ${
                isEditing 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Toggle manual SQL editing mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isEditing ? 'Editing' : 'Edit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-4">
        {/* If self-correction occurred, show original candidate vs final SQL diff badge */}
        {isCorrected && generatedSql && generatedSql !== sql && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px] text-amber-300 mb-1">
              <span>⚠️ Initial Uncorrected Query (contained detected error):</span>
            </div>
            <code className="text-amber-200/80 font-mono text-xs block pl-2 border-l-2 border-amber-500/50">
              {generatedSql}
            </code>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              rows={4}
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              className="w-full font-mono text-xs bg-slate-950 border border-sky-500/50 rounded-lg p-3 text-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y leading-relaxed"
              placeholder="SELECT ... FROM ..."
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                * Edited queries are subjected to the same strict syntax, schema & read-only checks.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditedCode(sql);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunEdit}
                  disabled={isExecuting || !editedCode.trim()}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Validate & Run
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative font-mono text-xs leading-relaxed overflow-x-auto p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-emerald-300">
            {sql ? (
              <pre className="whitespace-pre-wrap">{sql}</pre>
            ) : (
              <div className="text-slate-600 italic">
                -- No query generated yet. Submit a natural language question above to produce SQL.
              </div>
            )}
          </div>
        )}

        {/* Error message box if failed */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-200">Execution Rejected:</div>
              <div className="font-mono text-[11px] mt-0.5 text-red-300/90">{error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

