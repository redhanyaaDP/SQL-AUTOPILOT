# SQL-AutoPilot ⚡

> **An LLM-Based SQL Query Generation System with Automated Validation and Self-Correction**  
> Full-Stack Web Application for Database Management Systems, Natural Language Processing, and Artificial Intelligence.

---

## 👥 Team Division
- **Member 1**: Research, Literature Survey, Problem Formulation & Documentation
- **Member 2**: Database Architecture, SQLite Schema, FastAPI Services & Execution Safety
- **Member 3 (Lead Integrator)**: React UI Dashboard, Self-Correction Timeline, Recharts Visualization & Pipeline Integration

---

## 🌟 Key Features

1. **Natural Language Query Input**: Ask analytical questions in everyday English (e.g., *"Show students with CGPA above 8.5"*).
2. **Automated Schema Analyzer**: Injects table definitions, types, and foreign key relationships into the prompt context.
3. **Multi-Stage SQL Validator**: Verifies syntax, table/column identifiers, and strictly enforces read-only access rules (rejects `DROP`, `DELETE`, `UPDATE`, `ALTER`, etc.).
4. **Bounded Self-Correction Loop**: Catches schema mismatches (e.g. `gpa` $\rightarrow$ `cgpa`, `student_details` $\rightarrow$ `students`), requests LLM corrections with error diagnostics, and re-validates before execution (max 3 bounded attempts).
5. **Interactive Audit Timeline**: Displays every step: Initial Candidate $\rightarrow$ Validation Check $\rightarrow$ Error Feedback $\rightarrow$ Correction Loop $\rightarrow$ Safe Execution.
6. **Live Data Results Table**: Formatted results with sortable columns, search filter, and one-click CSV export.
7. **Dynamic Result Visualization**: Auto-renders Bar & Line charts via Recharts for numerical/categorical aggregations.
8. **Interactive Schema Visualizer**: Entity-Relationship diagram and table definitions with Primary/Foreign Key tags and sample data previews.
9. **Query Optimizer & Benchmark**: Side-by-side comparison of baseline scans vs index-assisted execution plans.
10. **Query History & Audit Log**: Persistent query logs with one-click re-run capability.

---

## 🚀 Quick Start Guide

### Frontend Setup (React + Vite + Tailwind CSS)

1. Open a terminal and navigate to this folder:
   ```bash
   cd C:\Users\REDHANYAA\.gemini\antigravity\scratch\sql-autopilot
   ```

2. Run the development server:
   ```bash
   npm.cmd run dev
   ```

3. Open `http://localhost:3000` in your browser.

> [!NOTE]
> The frontend includes a **Dual-Mode Engine**. It works 100% out of the box with the built-in intelligent engine even if the backend is not yet started, making it immediately testable and ready for viva demonstrations!

---

### Backend Setup (FastAPI + SQLite)

For Member 2:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

