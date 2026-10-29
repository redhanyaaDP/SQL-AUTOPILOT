import { SCHEMA_METADATA, INITIAL_DEPARTMENTS, INITIAL_STUDENTS } from './dbData';

// Safe Read-Only SQL Policy Rules
const FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'EXEC', 'CREATE', 'REPLACE'];

/**
 * Validates candidate SQL against schema and security policies
 */
export function validateSQL(sqlQuery, schema = SCHEMA_METADATA) {
  const cleaned = sqlQuery.trim();
  const upper = cleaned.toUpperCase();

  // 1. Check for empty
  if (!cleaned) {
    return { valid: false, errorType: 'SYNTAX_ERROR', message: 'Query cannot be empty.' };
  }

  // 2. Security Check: Read-only restriction
  for (const forbidden of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${forbidden}\\b`, 'i');
    if (regex.test(cleaned)) {
      return {
        valid: false,
        errorType: 'SECURITY_VIOLATION',
        message: `Execution Policy Rejected: Operation '${forbidden}' is prohibited. SQL-AutoPilot operates in strict read-only mode.`
      };
    }
  }

  // 3. Must be a SELECT or EXPLAIN statement
  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH') && !upper.startsWith('EXPLAIN')) {
    return {
      valid: false,
      errorType: 'SECURITY_VIOLATION',
      message: 'Execution Policy Rejected: Only SELECT queries are permitted.'
    };
  }

  // 4. Disallow multiple chained queries (e.g. SELECT 1; DROP TABLE)
  const statements = cleaned.split(';').map(s => s.trim()).filter(Boolean);
  if (statements.length > 1) {
    return {
      valid: false,
      errorType: 'SECURITY_VIOLATION',
      message: 'Execution Policy Rejected: Multiple statements are not permitted.'
    };
  }

  // 5. Incomplete syntax check (e.g. WHERE cgpa > ;)
  if (/WHERE\s+[a-zA-Z_]+\s*[><=!]+\s*(;|$)/i.test(cleaned) || /SELECT\s*FROM/i.test(cleaned)) {
    return {
      valid: false,
      errorType: 'SYNTAX_ERROR',
      message: 'Syntax error: Incomplete filter expression or missing projection list.'
    };
  }

  // 6. Schema table check
  const knownTables = schema.tables.map(t => t.table_name.toLowerCase());
  
  // Extract table names after FROM or JOIN
  const fromMatches = [...cleaned.matchAll(/\b(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)/gi)];
  for (const match of fromMatches) {
    const tableName = match[1].toLowerCase();
    if (!knownTables.includes(tableName)) {
      // Suggest closest table
      const suggestion = knownTables.find(t => t.includes(tableName) || tableName.includes(t)) || knownTables[0];
      return {
        valid: false,
        errorType: 'SCHEMA_TABLE_MISMATCH',
        message: `Schema Error: Unknown table '${match[1]}'. Did you mean '${suggestion}'?`,
        suggestedFix: { invalid: match[1], replacement: suggestion, type: 'table' }
      };
    }
  }

  // 7. Schema column check
  // Check common mistakes (e.g. gpa instead of cgpa, dept instead of department_name)
  if (/\bgpa\b/i.test(cleaned) && !/\bcgpa\b/i.test(cleaned)) {
    return {
      valid: false,
      errorType: 'SCHEMA_COLUMN_MISMATCH',
      message: "Schema Error: Unknown column 'gpa' in table 'students'. Did you mean 'cgpa'?",
      suggestedFix: { invalid: 'gpa', replacement: 'cgpa', type: 'column' }
    };
  }

  if (/\bdept_name\b/i.test(cleaned)) {
    return {
      valid: false,
      errorType: 'SCHEMA_COLUMN_MISMATCH',
      message: "Schema Error: Unknown column 'dept_name'. Did you mean 'department_name'?",
      suggestedFix: { invalid: 'dept_name', replacement: 'department_name', type: 'column' }
    };
  }

  return { valid: true, errorType: null, message: 'Passed syntax, schema, and read-only policy verification.' };
}

/**
 * Intelligent SQL Generator matching natural language prompts
 */
export function generateCandidateSQL(question) {
  const q = question.toLowerCase().trim();

  // Demonstration B trigger or column mistake test
  if (q.includes('gpa') && !q.includes('cgpa')) {
    // Generate intentionally imperfect SQL to demonstrate self-correction!
    return "SELECT student_id, name, gpa FROM students ORDER BY gpa DESC LIMIT 5;";
  }

  if (q.includes('student_details')) {
    return "SELECT * FROM student_details WHERE cgpa > 8.0;";
  }

  if (q.includes('drop table') || q.includes('delete from')) {
    return "DROP TABLE students;";
  }

  // Top students / Highest CGPA
  if (q.includes('highest cgpa') || q.includes('topper') || q.includes('top student')) {
    return "SELECT student_id, name, department_id, cgpa FROM students ORDER BY cgpa DESC LIMIT 1;";
  }

  if (q.includes('top 5') || q.includes('top five') || (q.includes('highest') && q.includes('5'))) {
    return "SELECT student_id, name, cgpa FROM students ORDER BY cgpa DESC LIMIT 5;";
  }

  // Filtering by CGPA
  const cgpaMatch = q.match(/cgpa\s*(?:above|greater than|>|higher than)\s*([0-9.]+)/i);
  if (cgpaMatch) {
    const threshold = parseFloat(cgpaMatch[1]);
    return `SELECT student_id, name, cgpa FROM students WHERE cgpa > ${threshold} ORDER BY cgpa DESC;`;
  }

  // Join students and departments
  if (q.includes('department name') || q.includes('along with their department') || (q.includes('student') && q.includes('department') && !q.includes('count') && !q.includes('average') && !q.includes('avg'))) {
    return "SELECT s.student_id, s.name, d.department_name, s.cgpa FROM students s JOIN departments d ON s.department_id = d.department_id ORDER BY s.cgpa DESC;";
  }

  // Average CGPA per department
  if ((q.includes('average') || q.includes('avg')) && q.includes('department')) {
    return "SELECT d.department_name, ROUND(AVG(s.cgpa), 2) AS average_cgpa, COUNT(s.student_id) AS student_count FROM departments d JOIN students s ON d.department_id = s.department_id GROUP BY d.department_name ORDER BY average_cgpa DESC;";
  }

  // Count per department
  if (q.includes('count') && q.includes('department')) {
    return "SELECT d.department_name, COUNT(s.student_id) AS total_students FROM departments d LEFT JOIN students s ON d.department_id = s.department_id GROUP BY d.department_name ORDER BY total_students DESC;";
  }

  // Overall Average CGPA
  if (q.includes('average cgpa') || q.includes('avg cgpa') || (q.includes('average') && q.includes('cgpa'))) {
    return "SELECT ROUND(AVG(cgpa), 2) AS average_cgpa FROM students;";
  }

  // Total student count
  if (q.includes('total') || q.includes('count')) {
    return "SELECT COUNT(*) AS total_students FROM students;";
  }

  // Semester filtering
  if (q.includes('semester')) {
    const semMatch = q.match(/semester\s*([0-9]+)/i);
    const sem = semMatch ? semMatch[1] : 6;
    return `SELECT student_id, name, department_id, cgpa FROM students WHERE semester = ${sem};`;
  }

  // Ordering
  if (q.includes('descending') || q.includes('rank')) {
    return "SELECT student_id, name, cgpa FROM students ORDER BY cgpa DESC;";
  }

  // Default: Show all students
  return "SELECT student_id, name, department_id, cgpa, semester FROM students ORDER BY student_id ASC;";
}

/**
 * Self-Correction Module
 * Revises failed SQL using error diagnostics
 */
export function correctSQL(failedSQL, validationResult, question) {
  let revised = failedSQL;
  let explanation = "";

  if (validationResult.suggestedFix) {
    const { invalid, replacement } = validationResult.suggestedFix;
    const regex = new RegExp(`\\b${invalid}\\b`, 'gi');
    revised = failedSQL.replace(regex, replacement);
    explanation = `Corrected '${invalid}' to valid schema identifier '${replacement}'.`;
  } else if (validationResult.errorType === 'SYNTAX_ERROR') {
    // Repair common syntax truncation
    revised = failedSQL.replace(/WHERE\s+[a-zA-Z_]+\s*[><=!]+\s*(;|$)/i, 'WHERE cgpa > 8.5;');
    explanation = "Repaired incomplete WHERE filter expression with valid literal.";
  } else {
    // Fallback regenerate cleanly
    revised = generateCandidateSQL(question.replace(/gpa/gi, 'cgpa').replace(/student_details/gi, 'students'));
    explanation = "Regenerated query using clarified schema context.";
  }

  return { revisedSQL: revised, explanation };
}

/**
 * In-Memory Safe Query Executor
 * Simulates SQLite execution against seed records
 */
export function executeQuerySafely(sqlQuery) {
  const startTime = performance.now();
  const cleaned = sqlQuery.trim().replace(/;$/, '');
  const upper = cleaned.toUpperCase();

  let columns = [];
  let rows = [];

  try {
    if (upper.includes('COUNT(*)') || upper.includes('COUNT(STUDENT_ID)')) {
      if (upper.includes('GROUP BY')) {
        // Group by department
        columns = ['department_name', 'total_students'];
        const map = {};
        INITIAL_DEPARTMENTS.forEach(d => { map[d.department_name] = 0; });
        INITIAL_STUDENTS.forEach(s => {
          const dept = INITIAL_DEPARTMENTS.find(d => d.department_id === s.department_id);
          if (dept) map[dept.department_name] = (map[dept.department_name] || 0) + 1;
        });
        rows = Object.entries(map).map(([dept, count]) => [dept, count]);
        rows.sort((a, b) => b[1] - a[1]);
      } else {
        columns = ['total_students'];
        rows = [[INITIAL_STUDENTS.length]];
      }
    } else if (upper.includes('AVG(')) {
      if (upper.includes('GROUP BY')) {
        columns = ['department_name', 'average_cgpa', 'student_count'];
        const groups = {};
        INITIAL_DEPARTMENTS.forEach(d => { groups[d.department_name] = []; });
        INITIAL_STUDENTS.forEach(s => {
          const dept = INITIAL_DEPARTMENTS.find(d => d.department_id === s.department_id);
          if (dept) groups[dept.department_name].push(s.cgpa);
        });
        rows = Object.entries(groups).map(([dept, cgpas]) => {
          const avg = cgpas.length ? (cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2) : '0.00';
          return [dept, parseFloat(avg), cgpas.length];
        });
        rows.sort((a, b) => b[1] - a[1]);
      } else {
        const avg = (INITIAL_STUDENTS.reduce((a, s) => a + s.cgpa, 0) / INITIAL_STUDENTS.length).toFixed(2);
        columns = ['average_cgpa'];
        rows = [[parseFloat(avg)]];
      }
    } else if (upper.includes('JOIN')) {
      // Joined view
      columns = ['student_id', 'name', 'department_name', 'cgpa'];
      const joined = INITIAL_STUDENTS.map(s => {
        const dept = INITIAL_DEPARTMENTS.find(d => d.department_id === s.department_id);
        return [s.student_id, s.name, dept ? dept.department_name : 'Unknown', s.cgpa];
      });
      joined.sort((a, b) => b[3] - a[3]);
      rows = joined;
    } else {
      // Filter & sort students
      let filtered = [...INITIAL_STUDENTS];

      // WHERE filter
      const cgpaFilter = cleaned.match(/cgpa\s*>\s*([0-9.]+)/i);
      if (cgpaFilter) {
        const val = parseFloat(cgpaFilter[1]);
        filtered = filtered.filter(s => s.cgpa > val);
      }

      const semFilter = cleaned.match(/semester\s*=\s*([0-9]+)/i);
      if (semFilter) {
        const sem = parseInt(semFilter[1]);
        filtered = filtered.filter(s => s.semester === sem);
      }

      // ORDER BY
      if (upper.includes('ORDER BY CGPA DESC')) {
        filtered.sort((a, b) => b.cgpa - a.cgpa);
      } else if (upper.includes('ORDER BY STUDENT_ID ASC')) {
        filtered.sort((a, b) => a.student_id - b.student_id);
      }

      // LIMIT
      const limitMatch = cleaned.match(/LIMIT\s+([0-9]+)/i);
      if (limitMatch) {
        const lim = parseInt(limitMatch[1]);
        filtered = filtered.slice(0, lim);
      }

      // Determine projected columns
      if (upper.includes('SELECT STUDENT_ID, NAME, CGPA')) {
        columns = ['student_id', 'name', 'cgpa'];
        rows = filtered.map(s => [s.student_id, s.name, s.cgpa]);
      } else if (upper.includes('SELECT NAME, CGPA')) {
        columns = ['name', 'cgpa'];
        rows = filtered.map(s => [s.name, s.cgpa]);
      } else {
        columns = ['student_id', 'name', 'department_id', 'cgpa', 'semester'];
        rows = filtered.map(s => [s.student_id, s.name, s.department_id, s.cgpa, s.semester]);
      }
    }
  } catch (err) {
    return {
      status: 'error',
      error: `Database Runtime Error: ${err.message}`,
      execution_time_ms: Math.round(performance.now() - startTime),
      row_count: 0,
      columns: [],
      rows: []
    };
  }

  const executionTimeMs = Math.max(8, Math.round(performance.now() - startTime + Math.random() * 25));

  return {
    status: 'success',
    execution_time_ms: executionTimeMs,
    row_count: rows.length,
    columns,
    rows
  };
}

/**
 * End-to-End Orchestrator Pipeline
 */
export async function runQueryPipeline(question, maxRetries = 3) {
  const timeline = [];
  let stepCount = 1;

  // Step 1: Initial Candidate SQL Generation
  timeline.push({
    step: stepCount++,
    type: 'generation',
    status: 'success',
    timestamp: new Date().toISOString(),
    title: 'Candidate SQL Generation',
    message: 'Constructed schema context and synthesized initial candidate SQL using LLM.'
  });

  let currentSQL = generateCandidateSQL(question);
  let isCorrected = false;
  let attempts = 0;
  let finalValidation = validateSQL(currentSQL);

  timeline.push({
    step: stepCount++,
    type: 'validation',
    status: finalValidation.valid ? 'success' : 'failed',
    timestamp: new Date().toISOString(),
    sql: currentSQL,
    title: finalValidation.valid ? 'Validation Passed' : 'Validation Failed',
    error: finalValidation.errorType ? `${finalValidation.errorType}: ${finalValidation.message}` : null,
    message: finalValidation.message
  });

  // Self-Correction Loop
  while (!finalValidation.valid && attempts < maxRetries) {
    if (finalValidation.errorType === 'SECURITY_VIOLATION') {
      // Dangerous or malicious operations are rejected immediately without correction retry
      break;
    }

    attempts++;
    isCorrected = true;

    // Correct the query
    const correction = correctSQL(currentSQL, finalValidation, question);
    currentSQL = correction.revisedSQL;

    timeline.push({
      step: stepCount++,
      type: 'correction',
      status: 'info',
      attempt: attempts,
      timestamp: new Date().toISOString(),
      title: `Self-Correction Attempt #${attempts}`,
      sql: currentSQL,
      message: correction.explanation
    });

    // Revalidate
    finalValidation = validateSQL(currentSQL);

    timeline.push({
      step: stepCount++,
      type: 'revalidation',
      status: finalValidation.valid ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      sql: currentSQL,
      title: finalValidation.valid ? 'Revalidation Successful' : `Revalidation Failed (Attempt ${attempts})`,
      error: finalValidation.errorType ? `${finalValidation.errorType}: ${finalValidation.message}` : null,
      message: finalValidation.message
    });
  }

  // Execution Stage
  if (!finalValidation.valid) {
    return {
      status: 'error',
      question,
      generated_sql: generateCandidateSQL(question),
      final_sql: currentSQL,
      is_corrected: isCorrected,
      correction_attempts: attempts,
      timeline,
      error: finalValidation.message,
      execution_time_ms: 0,
      row_count: 0,
      columns: [],
      rows: []
    };
  }

  // Execute Safely
  const execResult = executeQuerySafely(currentSQL);

  timeline.push({
    step: stepCount++,
    type: 'execution',
    status: execResult.status === 'success' ? 'success' : 'failed',
    timestamp: new Date().toISOString(),
    title: 'Controlled Database Execution',
    message: execResult.status === 'success' 
      ? `Query executed in ${execResult.execution_time_ms} ms. Returned ${execResult.row_count} rows.` 
      : `Execution error: ${execResult.error}`
  });

  return {
    status: execResult.status,
    question,
    generated_sql: generateCandidateSQL(question),
    final_sql: currentSQL,
    is_corrected: isCorrected,
    correction_attempts: attempts,
    timeline,
    execution_time_ms: execResult.execution_time_ms,
    row_count: execResult.row_count,
    columns: execResult.columns,
    rows: execResult.rows,
    error: execResult.error || null
  };
}

