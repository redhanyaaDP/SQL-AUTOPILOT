// Database Schema Definitions and In-Memory Demo Data

export const SCHEMA_METADATA = {
  database_name: "educational_records.sqlite",
  dialect: "SQLite 3",
  tables: [
    {
      table_name: "departments",
      description: "Academic departments in the university",
      columns: [
        { name: "department_id", type: "INTEGER", is_primary_key: true, nullable: false },
        { name: "department_name", type: "TEXT", is_primary_key: false, nullable: false },
        { name: "building", type: "TEXT", is_primary_key: false, nullable: true }
      ]
    },
    {
      table_name: "students",
      description: "Enrolled undergraduate students and academic records",
      columns: [
        { name: "student_id", type: "INTEGER", is_primary_key: true, nullable: false },
        { name: "name", type: "TEXT", is_primary_key: false, nullable: false },
        { name: "department_id", type: "INTEGER", is_primary_key: false, nullable: false, foreign_key: "departments.department_id" },
        { name: "cgpa", type: "REAL", is_primary_key: false, nullable: false },
        { name: "semester", type: "INTEGER", is_primary_key: false, nullable: false }
      ]
    }
  ],
  relationships: [
    {
      from_table: "students",
      from_column: "department_id",
      to_table: "departments",
      to_column: "department_id",
      type: "many-to-one"
    }
  ]
};

export const INITIAL_DEPARTMENTS = [
  { department_id: 1, department_name: "Computer Science", building: "Ramanujan Hall" },
  { department_id: 2, department_name: "Electronics & Communication", building: "Vikram Sarabhai Block" },
  { department_id: 3, department_name: "Mechanical Engineering", building: "Visvesvaraya Complex" },
  { department_id: 4, department_name: "Information Technology", building: "Alan Turing Block" }
];

export const INITIAL_STUDENTS = [
  { student_id: 101, name: "Ananya Sharma", department_id: 1, cgpa: 9.42, semester: 6 },
  { student_id: 102, name: "Priya Nair", department_id: 2, cgpa: 8.91, semester: 6 },
  { student_id: 103, name: "Rahul Verma", department_id: 1, cgpa: 8.75, semester: 4 },
  { student_id: 104, name: "Kavya Iyer", department_id: 4, cgpa: 8.40, semester: 6 },
  { student_id: 105, name: "Aditya Patel", department_id: 3, cgpa: 7.82, semester: 8 },
  { student_id: 106, name: "Sneha Kulkarni", department_id: 1, cgpa: 9.68, semester: 4 },
  { student_id: 107, name: "Rohan Mehta", department_id: 2, cgpa: 7.95, semester: 6 },
  { student_id: 108, name: "Divya Reddy", department_id: 4, cgpa: 8.88, semester: 4 },
  { student_id: 109, name: "Arjun Singh", department_id: 3, cgpa: 8.12, semester: 8 },
  { student_id: 110, name: "Pooja Hegde", department_id: 4, cgpa: 9.15, semester: 6 },
  { student_id: 111, name: "Vikram Das", department_id: 2, cgpa: 8.35, semester: 4 },
  { student_id: 112, name: "Siddharth Sen", department_id: 1, cgpa: 8.64, semester: 8 }
];

