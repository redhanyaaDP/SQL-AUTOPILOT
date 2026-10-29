import React, { useState } from 'react';
import { Database, Key, Link2, Table, Eye, Layers, ArrowRight } from 'lucide-react';
import { SCHEMA_METADATA, INITIAL_DEPARTMENTS, INITIAL_STUDENTS } from '../../services/dbData';

export default function SchemaViewer() {
  const [activePreview, setActivePreview] = useState(null);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-dark-850/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Database className="w-4 h-4" />
            Connected Relational Schema: {SCHEMA_METADATA.database_name}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Engineered for academic queries: Filtering, Ranking, Joins, and Department Aggregations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-900 border border-slate-700/80 text-slate-300 rounded-lg text-xs font-mono">
            Dialect: {SCHEMA_METADATA.dialect}
          </span>
          <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg text-xs font-mono">
            2 Tables • 1 Relationship
          </span>
        </div>
      </div>

      {/* Relational Diagram Card */}
      <div className="bg-dark-850/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-sky-400" />
          Entity-Relationship Structure
        </h3>

        <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-center gap-6 text-xs">
          {/* Parent Table */}
          <div className="w-full md:w-64 p-3.5 bg-slate-900 rounded-lg border border-sky-500/30 shadow-lg shadow-sky-500/5">
            <div className="font-mono font-bold text-sky-400 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Table className="w-3.5 h-3.5" /> DEPARTMENTS (Parent)
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex items-center justify-between text-amber-300">
                <span>department_id</span>
                <span className="text-[10px] bg-amber-500/20 px-1 rounded">PK</span>
              </div>
              <div className="text-slate-400">department_name</div>
              <div className="text-slate-400">building</div>
            </div>
          </div>

          {/* Relation connector */}
          <div className="flex flex-col items-center justify-center text-slate-500">
            <span className="text-[10px] font-mono text-sky-400 font-semibold mb-1">1-to-Many</span>
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-sky-500/50" />
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1">department_id (FK)</span>
          </div>

          {/* Child Table */}
          <div className="w-full md:w-64 p-3.5 bg-slate-900 rounded-lg border border-sky-500/30 shadow-lg shadow-sky-500/5">
            <div className="font-mono font-bold text-sky-400 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Table className="w-3.5 h-3.5" /> STUDENTS (Child)
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex items-center justify-between text-amber-300">
                <span>student_id</span>
                <span className="text-[10px] bg-amber-500/20 px-1 rounded">PK</span>
              </div>
              <div className="text-slate-400">name</div>
              <div className="flex items-center justify-between text-cyan-300">
                <span>department_id</span>
                <span className="text-[10px] bg-cyan-500/20 px-1 rounded">FK</span>
              </div>
              <div className="text-emerald-300">cgpa</div>
              <div className="text-slate-400">semester</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table Definitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SCHEMA_METADATA.tables.map((table, tIdx) => (
          <div key={tIdx} className="bg-dark-850/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-mono font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Table className="w-4 h-4 text-sky-400" />
                  {table.table_name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{table.description}</p>
              </div>

              <button
                onClick={() => setActivePreview(activePreview === table.table_name ? null : table.table_name)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                  activePreview === table.table_name
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{activePreview === table.table_name ? 'Hide Data' : 'Preview Data'}</span>
              </button>
            </div>

            {/* Column Schema Table */}
            <div className="p-4 flex-1">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="pb-2">Column</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Constraint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {table.columns.map((col, cIdx) => (
                    <tr key={cIdx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 font-medium text-slate-100 flex items-center gap-1.5">
                        {col.is_primary_key && <Key className="w-3 h-3 text-amber-400 shrink-0" />}
                        {col.foreign_key && <Link2 className="w-3 h-3 text-cyan-400 shrink-0" />}
                        <span>{col.name}</span>
                      </td>
                      <td className="py-2.5 text-sky-400">{col.type}</td>
                      <td className="py-2.5">
                        {col.is_primary_key ? (
                          <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            PRIMARY KEY
                          </span>
                        ) : col.foreign_key ? (
                          <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            FK → {col.foreign_key}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">NOT NULL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline Sample Data Preview */}
            {activePreview === table.table_name && (
              <div className="border-t border-slate-800 bg-slate-950/90 p-4 max-h-56 overflow-auto">
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 font-semibold">
                  Sample Records ({table.table_name === 'students' ? INITIAL_STUDENTS.length : INITIAL_DEPARTMENTS.length} total)
                </div>
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      {table.columns.map((col, idx) => (
                        <th key={idx} className="pb-1.5 pr-3">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {(table.table_name === 'students' ? INITIAL_STUDENTS.slice(0, 5) : INITIAL_DEPARTMENTS).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {table.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-1.5 pr-3 whitespace-nowrap">
                            {row[col.name]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

