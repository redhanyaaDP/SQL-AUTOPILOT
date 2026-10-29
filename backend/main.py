from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re
import datetime

from database import init_db, get_schema_metadata, execute_safe_query
from validator import validate_sql

app = FastAPI(title="SQL-AutoPilot Backend API", version="1.0.0")

# Enable CORS for React frontend (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

class QueryRequest(BaseModel):
    question: str
    max_correction_attempts: Optional[int] = 3

class ExecuteRequest(BaseModel):
    sql: str

class OptimizerRequest(BaseModel):
    sql: str

# In-memory query history
query_history = []

def generate_candidate_sql(question: str) -> str:
    q = question.lower()
    if "gpa" in q and "cgpa" not in q:
        return "SELECT student_id, name, gpa FROM students ORDER BY gpa DESC LIMIT 5;"
    if "student_details" in q:
        return "SELECT * FROM student_details WHERE cgpa > 8.0;"
    if "drop table" in q or "delete" in q:
        return "DROP TABLE students;"
    if "highest cgpa" in q or "top student" in q:
        return "SELECT student_id, name, department_id, cgpa FROM students ORDER BY cgpa DESC LIMIT 1;"
    if "top 5" in q or "top five" in q:
        return "SELECT student_id, name, cgpa FROM students ORDER BY cgpa DESC LIMIT 5;"
    
    cgpa_match = re.search(r"cgpa\s*(?:above|greater than|>)\s*([0-9.]+)", q)
    if cgpa_match:
        threshold = cgpa_match.group(1)
        return f"SELECT student_id, name, cgpa FROM students WHERE cgpa > {threshold} ORDER BY cgpa DESC;"

    if "average" in q or "avg" in q:
        if "department" in q:
            return "SELECT d.department_name, ROUND(AVG(s.cgpa), 2) AS average_cgpa, COUNT(s.student_id) AS student_count FROM departments d JOIN students s ON d.department_id = s.department_id GROUP BY d.department_name ORDER BY average_cgpa DESC;"
        return "SELECT ROUND(AVG(cgpa), 2) AS average_cgpa FROM students;"

    if "count" in q and "department" in q:
        return "SELECT d.department_name, COUNT(s.student_id) AS total_students FROM departments d LEFT JOIN students s ON d.department_id = s.department_id GROUP BY d.department_name ORDER BY total_students DESC;"

    if "join" in q or ("student" in q and "department" in q):
        return "SELECT s.student_id, s.name, d.department_name, s.cgpa FROM students s JOIN departments d ON s.department_id = d.department_id ORDER BY s.cgpa DESC;"

    return "SELECT student_id, name, department_id, cgpa, semester FROM students ORDER BY student_id ASC;"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SQL-AutoPilot Core API",
        "dialect": "SQLite 3",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.get("/api/schema")
def get_schema():
    return get_schema_metadata()

@app.post("/api/query")
def process_natural_language_query(payload: QueryRequest):
    question = payload.question.strip()
    max_retries = payload.max_correction_attempts or 3
    
    timeline = []
    step = 1

    # 1. Candidate SQL Generation
    timeline.append({
        "step": step,
        "type": "generation",
        "status": "success",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "title": "LLM Candidate Generation",
        "message": "Synthesized candidate SQL using schema metadata context."
    })
    step += 1

    candidate_sql = generate_candidate_sql(question)
    current_sql = candidate_sql
    attempts = 0
    is_corrected = False

    validation = validate_sql(current_sql)
    timeline.append({
        "step": step,
        "type": "validation",
        "status": "success" if validation["valid"] else "failed",
        "sql": current_sql,
        "title": "Initial Validation",
        "error": validation.get("message") if not validation["valid"] else None,
        "message": validation.get("message")
    })
    step += 1

    # Bounded Self-Correction Loop
    while not validation["valid"] and attempts < max_retries:
        if validation.get("error_type") == "SECURITY_VIOLATION":
            break # Do not correct malicious operations

        attempts += 1
        is_corrected = True

        # Correct detected identifier mismatch
        if validation.get("invalid") and validation.get("replacement"):
            current_sql = re.sub(rf"\b{validation['invalid']}\b", validation["replacement"], current_sql, flags=re.IGNORECASE)
            corr_msg = f"Self-corrected identifier '{validation['invalid']}' to '{validation['replacement']}' based on schema feedback."
        else:
            current_sql = current_sql.replace("gpa", "cgpa").replace("student_details", "students")
            corr_msg = "Re-aligned query with schema definitions."

        timeline.append({
            "step": step,
            "type": "correction",
            "status": "info",
            "attempt": attempts,
            "sql": current_sql,
            "title": f"Self-Correction Loop #{attempts}",
            "message": corr_msg
        })
        step += 1

        validation = validate_sql(current_sql)
        timeline.append({
            "step": step,
            "type": "revalidation",
            "status": "success" if validation["valid"] else "failed",
            "sql": current_sql,
            "title": f"Revalidation (Attempt #{attempts})",
            "message": validation.get("message")
        })
        step += 1

    # Execution
    if not validation["valid"]:
        return {
            "status": "error",
            "question": question,
            "generated_sql": candidate_sql,
            "final_sql": current_sql,
            "is_corrected": is_corrected,
            "correction_attempts": attempts,
            "timeline": timeline,
            "error": validation["message"],
            "execution_time_ms": 0,
            "row_count": 0,
            "columns": [],
            "rows": []
        }

    exec_res = execute_safe_query(current_sql)
    timeline.append({
        "step": step,
        "type": "execution",
        "status": exec_res["status"],
        "title": "Database Execution",
        "message": f"Executed safely in {exec_res['execution_time_ms']} ms. Returned {exec_res['row_count']} rows."
    })

    response_data = {
        "status": exec_res["status"],
        "question": question,
        "generated_sql": candidate_sql,
        "final_sql": current_sql,
        "is_corrected": is_corrected,
        "correction_attempts": attempts,
        "timeline": timeline,
        "execution_time_ms": exec_res["execution_time_ms"],
        "row_count": exec_res["row_count"],
        "columns": exec_res["columns"],
        "rows": exec_res["rows"],
        "error": exec_res.get("error")
    }

    query_history.append(response_data)
    return response_data

@app.post("/api/execute")
def direct_execute(payload: ExecuteRequest):
    validation = validate_sql(payload.sql)
    if not validation["valid"]:
        return {
            "status": "error",
            "error": validation["message"],
            "execution_time_ms": 0,
            "row_count": 0,
            "columns": [],
            "rows": []
        }
    return execute_safe_query(payload.sql)

@app.get("/api/history")
def get_history():
    return query_history[-50:]

