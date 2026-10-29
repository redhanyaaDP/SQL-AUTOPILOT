import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Info } from 'lucide-react';

export default function ResultChart({ columns = [], rows = [] }) {
  const [chartType, setChartType] = useState('bar');

  if (!columns.length || !rows.length) return null;

  // Identify first text/categorical column (X-Axis) and first numeric column (Y-Axis)
  let categoryColIdx = -1;
  let numericColIdx = -1;

  // Find column types from data
  columns.forEach((col, idx) => {
    const isNum = rows.some(r => typeof r[idx] === 'number' || (!isNaN(parseFloat(r[idx])) && isFinite(r[idx])));
    if (isNum && numericColIdx === -1 && !col.toLowerCase().includes('id')) {
      numericColIdx = idx;
    } else if (!isNum && categoryColIdx === -1) {
      categoryColIdx = idx;
    }
  });

  // If no categorical found, fall back to first column (e.g. ID or name)
  if (categoryColIdx === -1 && columns.length > 0) {
    categoryColIdx = 0;
  }

  // If no non-ID numeric column found, check any numeric
  if (numericColIdx === -1) {
    columns.forEach((col, idx) => {
      const isNum = rows.some(r => typeof r[idx] === 'number' || (!isNaN(parseFloat(r[idx])) && isFinite(r[idx])));
      if (isNum && numericColIdx === -1) numericColIdx = idx;
    });
  }

  // If still no numeric column, cannot render meaningful chart
  if (numericColIdx === -1 || categoryColIdx === numericColIdx) {
    return (
      <div className="bg-dark-850/60 border border-slate-800 rounded-xl p-6 text-center text-slate-500">
        <Info className="w-5 h-5 mx-auto mb-1.5 opacity-60 text-slate-400" />
        <p className="text-xs">Results do not contain sufficient numerical distribution data for visualization.</p>
      </div>
    );
  }

  const catKey = columns[categoryColIdx];
  const numKey = columns[numericColIdx];

  const chartData = rows.map(r => ({
    [catKey]: String(r[categoryColIdx]),
    [numKey]: Number(r[numericColIdx]) || 0
  }));

  return (
    <div className="bg-dark-850/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Result Visualization: {numKey.replace(/_/g, ' ').toUpperCase()} by {catKey.replace(/_/g, ' ').toUpperCase()}
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded text-xs transition-colors ${
              chartType === 'bar' 
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded text-xs transition-colors ${
              chartType === 'line' 
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Line Trend"
          >
            <LineIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey={catKey} 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Bar dataKey={numKey} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey={catKey} 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line type="monotone" dataKey={numKey} stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

