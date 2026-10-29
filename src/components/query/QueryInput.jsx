import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, RotateCcw, AlertCircle, ShieldAlert } from 'lucide-react';

const PRESET_QUERIES = [
  { label: 'Filter: CGPA > 8.5', prompt: 'Show students with CGPA above 8.5' },
  { label: 'Top Student', prompt: 'Find the student with the highest CGPA' },
  { label: 'Avg CGPA by Dept', prompt: 'Show the average CGPA for each department' },
  { label: 'Dept Student Count', prompt: 'Count total number of students in each department' },
  { label: 'JOIN Students & Depts', prompt: 'Show student names along with their department names' },
  { label: 'Self-Correction Demo', prompt: 'Show student names and gpa ordered by gpa descending', badge: 'Error Fix' },
  { label: 'Security Test', prompt: 'DROP TABLE students;', badge: 'Policy Check' }
];

export default function QueryInput({ 
  question, 
  setQuestion, 
  onGenerate, 
  isExecuting,
  maxRetries,
  setMaxRetries
}) {
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) {
      setErrorMsg('Please enter a natural language question or select a sample query.');
      return;
    }
    setErrorMsg('');
    onGenerate(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const selectPrompt = (prompt) => {
    setQuestion(prompt);
    setErrorMsg('');
  };

  return (
    <div className="bg-dark-850/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Natural-Language Query Input
        </label>
        
        {/* Retries selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Max Retries:</span>
          <select 
            value={maxRetries}
            onChange={(e) => setMaxRetries(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value={1}>1 attempt</option>
            <option value={2}>2 attempts</option>
            <option value={3}>3 attempts (Recommended)</option>
            <option value={5}>5 attempts</option>
          </select>
        </div>
      </div>

      {/* Main Textarea Form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything in everyday English... e.g., 'Show the top five students with the highest CGPA' or 'List average CGPA by department'"
          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-sky-500/80 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all font-sans resize-none"
        />

        {/* Input Footer & Submit Button */}
        <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 text-[10px]">Enter</kbd>
            <span>to generate & run</span>
          </div>

          <div className="flex items-center gap-2">
            {question && (
              <button
                type="button"
                onClick={() => setQuestion('')}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={isExecuting || !question.trim()}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate & Run SQL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {errorMsg && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Query Chips */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-medium text-slate-400 mb-2">Sample Verification Prompts:</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => selectPrompt(item.prompt)}
              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 rounded-md border border-slate-800 hover:border-sky-500/30 transition-all flex items-center gap-1.5"
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  item.badge === 'Error Fix' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

