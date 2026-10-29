# SQL-AutoPilot — Backend API Service (FastAPI + SQLite)

This is the backend service for **SQL-AutoPilot**, designed to coordinate the Natural Language $\rightarrow$ SQL pipeline, schema validation, bounded self-correction, and restricted database execution.

## Setup Instructions (For Member 2)

### 1. Requirements
Ensure Python 3.9+ is installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Server
```bash
uvicorn main:app --reload --port 8000
```

The server will initialize the SQLite database `educational_records.db` with sample tables (`students` and `departments`) and listen at `http://localhost:8000`.

### 4. Interactive API Documentation
Open your browser and navigate to:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 5. API Endpoints
- `GET /api/health` — Service health check
- `GET /api/schema` — Relational schema metadata
- `POST /api/query` — Complete pipeline execution
- `POST /api/execute` — Direct query validation and execution
- `GET /api/history` — Query execution logs

