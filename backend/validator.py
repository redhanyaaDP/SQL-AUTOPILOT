import re

FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'EXEC', 'CREATE', 'REPLACE']
KNOWN_TABLES = ['students', 'departments']
KNOWN_COLUMNS = {
    'students': ['student_id', 'name', 'department_id', 'cgpa', 'semester'],
    'departments': ['department_id', 'department_name', 'building']
}

def validate_sql(sql_query: str):
    cleaned = sql_query.strip()
    upper = cleaned.upper()

    if not cleaned:
        return {"valid": False, "error_type": "SYNTAX_ERROR", "message": "Query cannot be empty."}

    # Policy Check: Reject destructive keywords
    for word in FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{word}\b", cleaned, re.IGNORECASE):
            return {
                "valid": False,
                "error_type": "SECURITY_VIOLATION",
                "message": f"Execution Policy Violation: Command '{word}' is strictly forbidden in read-only mode."
            }

    # Must start with SELECT or WITH
    if not (upper.startswith('SELECT') or upper.startswith('WITH') or upper.startswith('EXPLAIN')):
        return {
            "valid": False,
            "error_type": "SECURITY_VIOLATION",
            "message": "Only read-only SELECT queries are permitted."
        }

    # Disallow statement chaining
    statements = [s for s in cleaned.split(';') if s.strip()]
    if len(statements) > 1:
        return {
            "valid": False,
            "error_type": "SECURITY_VIOLATION",
            "message": "Multiple statements are rejected."
        }

    # Check for known schema errors
    from_matches = re.findall(r"\b(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)", cleaned, re.IGNORECASE)
    for tbl in from_matches:
        if tbl.lower() not in KNOWN_TABLES:
            return {
                "valid": False,
                "error_type": "SCHEMA_TABLE_MISMATCH",
                "message": f"Table '{tbl}' does not exist in schema. Did you mean 'students'?",
                "invalid": tbl,
                "replacement": "students"
            }

    # Column mismatch check
    if re.search(r"\bgpa\b", cleaned, re.IGNORECASE) and not re.search(r"\bcgpa\b", cleaned, re.IGNORECASE):
        return {
            "valid": False,
            "error_type": "SCHEMA_COLUMN_MISMATCH",
            "message": "Column 'gpa' does not exist in table 'students'. Did you mean 'cgpa'?",
            "invalid": "gpa",
            "replacement": "cgpa"
        }

    return {"valid": True, "error_type": None, "message": "Query passed all validation checks."}

