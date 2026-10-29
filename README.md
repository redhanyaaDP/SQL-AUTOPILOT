# SQL-AutoPilot ⚡

> **An LLM-Based SQL Query Generation System with Automated Validation and Self-Correction**  
> Full-Stack Web Application for Database Management Systems, Natural Language Processing, and Artificial Intelligence.


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
