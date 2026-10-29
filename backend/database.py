import sqlite3
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "educational_records.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create departments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        department_id INTEGER PRIMARY KEY,
        department_name TEXT NOT NULL,
        building TEXT
    );
    """)

    # Create students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        student_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        cgpa REAL NOT NULL,
        semester INTEGER NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
    );
    """)

    # Seed departments if empty
    cursor.execute("SELECT COUNT(*) FROM departments;")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
        INSERT INTO departments (department_id, department_name, building)
        VALUES (?, ?, ?);
        """, [
            (1, "Computer Science", "Ramanujan Hall"),
            (2, "Electronics & Communication", "Vikram Sarabhai Block"),
            (3, "Mechanical Engineering", "Visvesvaraya Complex"),
            (4, "Information Technology", "Alan Turing Block")
        ])

    # Seed students if empty
    cursor.execute("SELECT COUNT(*) FROM students;")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
        INSERT INTO students (student_id, name, department_id, cgpa, semester)
        VALUES (?, ?, ?, ?, ?);
        """, [
            (101, "Ananya Sharma", 1, 9.42, 6),
            (102, "Priya Nair", 2, 8.91, 6),
            (103, "Rahul Verma", 1, 8.75, 4),
            (104, "Kavya Iyer", 4, 8.40, 6),
            (105, "Aditya Patel", 3, 7.82, 8),
            (106, "Sneha Kulkarni", 1, 9.68, 4),
            (107, "Rohan Mehta", 2, 7.95, 6),
            (108, "Divya Reddy", 4, 8.88, 4),
            (109, "Arjun Singh", 3, 8.12, 8),
            (110, "Pooja Hegde", 4, 9.15, 6),
            (111, "Vikram Das", 2, 8.35, 4),
            (112, "Siddharth Sen", 1, 8.64, 8)
        ])

    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_schema_metadata():
    return {
        "database_name": "educational_records.db",
        "dialect": "SQLite 3",
        "tables": [
            {
                "table_name": "departments",
                "description": "Academic departments in the university",
                "columns": [
                    {"name": "department_id", "type": "INTEGER", "is_primary_key": True},
                    {"name": "department_name", "type": "TEXT", "is_primary_key": False},
                    {"name": "building", "type": "TEXT", "is_primary_key": False}
                ]
            },
            {
                "table_name": "students",
                "description": "Enrolled undergraduate students and records",
                "columns": [
                    {"name": "student_id", "type": "INTEGER", "is_primary_key": True},
                    {"name": "name", "type": "TEXT", "is_primary_key": False},
                    {"name": "department_id", "type": "INTEGER", "is_primary_key": False, "foreign_key": "departments.department_id"},
                    {"name": "cgpa", "type": "REAL", "is_primary_key": False},
                    {"name": "semester", "type": "INTEGER", "is_primary_key": False}
                ]
            }
        ]
    }

def execute_safe_query(sql_query: str):
    start = time.perf_counter()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(sql_query)
        rows_data = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = [list(row) for row in rows_data]
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        conn.close()
        return {
            "status": "success",
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "execution_time_ms": elapsed_ms
        }
    except Exception as e:
        conn.close()
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "status": "error",
            "error": str(e),
            "columns": [],
            "rows": [],
            "row_count": 0,
            "execution_time_ms": elapsed_ms
        }

