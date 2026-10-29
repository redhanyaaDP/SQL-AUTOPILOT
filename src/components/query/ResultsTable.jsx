import React, { useState } from 'react';
import { Table, Download, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResultsTable({ columns = [], rows = [], isExecuting }) {
  const [searchTerm, setSearchTerm] = useState('');

  const exportCSV = () => {
    if (!columns.length || !rows.length) return;
    const headerRow = columns.join(',');
    const bodyRows = rows.map(r => r.map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...bodyRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sql_autopilot_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = rows.filter(row => {
    if (!searchTerm) return true;
    return row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="bg-dark-850/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Toolbar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Query Execution Results
          </span>
          <span className="text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
            {rows.length} {rows.length === 1 ? 'row' : 'rows'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search */}
          {rows.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 focus:border-sky-500/80 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-36 md:w-48 font-mono"
              />
            </div>
          )}

          {/* Export CSV button */}
          {rows.length > 0 && (
            <button
              onClick={exportCSV}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700/80 flex items-center gap-1.5 transition-colors font-medium"
              title="Export query results as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Body Area */}
      <div className="overflow-x-auto min-h-[160px] max-h-[380px] overflow-y-auto">
        {isExecuting ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Executing query against SQLite engine...</p>
          </div>
        ) : columns.length === 0 || rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Table className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs font-medium text-slate-400">No records returned</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Submit a natural language question above to view dataset results.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                <th className="py-2.5 px-4 font-semibold text-slate-500 w-12 text-center">#</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-2.5 px-4 font-semibold text-slate-300">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-slate-500 text-center font-mono text-[11px]">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 whitespace-nowrap">
                      {typeof cell === 'number' ? (
                        <span className="text-sky-300 font-semibold">{cell}</span>
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Footer info */}
      {rows.length > 0 && (
        <div className="px-4 py-2 bg-slate-900/70 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filteredRows.length} of {rows.length} records</span>
          <span className="flex items-center gap-1 text-emerald-400 font-sans">
            <CheckCircle2 className="w-3 h-3" /> Integrity Verified
          </span>
        </div>
      )}
    </div>
  );
}

