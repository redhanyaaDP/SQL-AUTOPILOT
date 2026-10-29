import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import QueryInput from './components/query/QueryInput';
import SQLEditor from './components/query/SQLEditor';
import CorrectionTimeline from './components/query/CorrectionTimeline';
import ExecutionStats from './components/query/ExecutionStats';
import ResultsTable from './components/query/ResultsTable';
import ResultChart from './components/query/ResultChart';
import SchemaViewer from './components/schema/SchemaViewer';
import OptimizerCompare from './components/optimizer/OptimizerCompare';
import HistoryList from './components/history/HistoryList';
import SettingsPage from './pages/SettingsPage';

import { submitNaturalLanguageQuery, executeDirectSQL, checkBackendHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [question, setQuestion] = useState('Show students with CGPA above 8.5');
  const [isExecuting, setIsExecuting] = useState(false);
  const [maxRetries, setMaxRetries] = useState(3);
  const [backendConnected, setBackendConnected] = useState(false);

  // Active query result state
  const [queryResult, setQueryResult] = useState({
    status: 'idle',
    question: '',
    generated_sql: '',
    final_sql: '',
    is_corrected: false,
    correction_attempts: 0,
    timeline: [],
    execution_time_ms: 0,
    row_count: 0,
    columns: [],
    rows: [],
    error: null
  });

  // Query execution history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sql_autopilot_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check backend health on mount
  useEffect(() => {
    async function checkHealth() {
      const health = await checkBackendHealth();
      setBackendConnected(health.connected);
    }
    checkHealth();
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('sql_autopilot_history', JSON.stringify(history));
  }, [history]);

  // Main pipeline execution handler
  const handleExecute = async (inputQuestion) => {
    const q = inputQuestion || question;
    if (!q.trim()) return;

    setIsExecuting(true);
    try {
      const result = await submitNaturalLanguageQuery(q, maxRetries);
      setQueryResult(result);

      // Append to history
      if (result.final_sql) {
        setHistory(prev => [
          {
            question: q,
            generated_sql: result.generated_sql,
            final_sql: result.final_sql,
            status: result.status,
            is_corrected: result.is_corrected,
            correction_attempts: result.correction_attempts,
            execution_time_ms: result.execution_time_ms,
            row_count: result.row_count,
            timestamp: new Date().toISOString()
          },
          ...prev.slice(0, 49) // Keep last 50
        ]);
      }
    } catch (err) {
      setQueryResult(prev => ({
        ...prev,
        status: 'error',
        error: `Pipeline execution failed: ${err.message}`
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  // Re-run edited SQL
  const handleRunEditedSql = async (editedSql) => {
    setIsExecuting(true);
    try {
      const res = await executeDirectSQL(editedSql);
      setQueryResult(prev => ({
        ...prev,
        final_sql: editedSql,
        status: res.status,
        execution_time_ms: res.execution_time_ms,
        row_count: res.row_count,
        columns: res.columns,
        rows: res.rows,
        error: res.error || null
      }));
    } catch (err) {
      setQueryResult(prev => ({
        ...prev,
        status: 'error',
        error: err.message
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  // Quick Viva Demo A: Successful Query
  const handleRunDemoA = () => {
    const prompt = "Show students with CGPA above 8.5";
    setQuestion(prompt);
    setActiveTab('dashboard');
    handleExecute(prompt);
  };

  // Quick Viva Demo B: Schema Mismatch & Self-Correction
  const handleRunDemoB = () => {
    const prompt = "Show student names and gpa ordered by gpa descending";
    setQuestion(prompt);
    setActiveTab('dashboard');
    handleExecute(prompt);
  };

  // Re-run from history
  const handleRerun = (q) => {
    setQuestion(q);
    setActiveTab('dashboard');
    handleExecute(q);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sql_autopilot_history');
  };

  return (
    <div className="flex h-screen bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendConnected={backendConnected} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header 
          activeTab={activeTab} 
          onRunDemoA={handleRunDemoA} 
          onRunDemoB={handleRunDemoB} 
          backendConnected={backendConnected}
          isExecuting={isExecuting}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Query Input Box */}
              <QueryInput
                question={question}
                setQuestion={setQuestion}
                onGenerate={handleExecute}
                isExecuting={isExecuting}
                maxRetries={maxRetries}
                setMaxRetries={setMaxRetries}
              />

              {/* Execution Metrics Banner */}
              <ExecutionStats
                executionTimeMs={queryResult.execution_time_ms}
                rowCount={queryResult.row_count}
                correctionAttempts={queryResult.correction_attempts}
                status={queryResult.status}
              />

              {/* Grid: SQL Inspector + Correction Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SQLEditor
                  sql={queryResult.final_sql}
                  generatedSql={queryResult.generated_sql}
                  isCorrected={queryResult.is_corrected}
                  status={queryResult.status}
                  error={queryResult.error}
                  onRunEditedSql={handleRunEditedSql}
                  isExecuting={isExecuting}
                />

                <CorrectionTimeline
                  timeline={queryResult.timeline}
                  isCorrected={queryResult.is_corrected}
                  correctionAttempts={queryResult.correction_attempts}
                />
              </div>

              {/* Grid: Results Table + Visualization Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResultsTable
                  columns={queryResult.columns}
                  rows={queryResult.rows}
                  isExecuting={isExecuting}
                />

                <ResultChart
                  columns={queryResult.columns}
                  rows={queryResult.rows}
                />
              </div>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="space-y-6">
              <QueryInput
                question={question}
                setQuestion={setQuestion}
                onGenerate={handleExecute}
                isExecuting={isExecuting}
                maxRetries={maxRetries}
                setMaxRetries={setMaxRetries}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SQLEditor
                  sql={queryResult.final_sql}
                  generatedSql={queryResult.generated_sql}
                  isCorrected={queryResult.is_corrected}
                  status={queryResult.status}
                  error={queryResult.error}
                  onRunEditedSql={handleRunEditedSql}
                  isExecuting={isExecuting}
                />

                <CorrectionTimeline
                  timeline={queryResult.timeline}
                  isCorrected={queryResult.is_corrected}
                  correctionAttempts={queryResult.correction_attempts}
                />
              </div>

              <ResultsTable
                columns={queryResult.columns}
                rows={queryResult.rows}
                isExecuting={isExecuting}
              />
            </div>
          )}

          {activeTab === 'schema' && (
            <SchemaViewer />
          )}

          {activeTab === 'optimizer' && (
            <OptimizerCompare />
          )}

          {activeTab === 'history' && (
            <HistoryList
              history={history}
              onRerun={handleRerun}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              backendConnected={backendConnected}
              onRefreshStatus={async () => {
                const health = await checkBackendHealth();
                setBackendConnected(health.connected);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

