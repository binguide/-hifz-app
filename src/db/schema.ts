export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('admin','teacher','student','parent')),
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS circles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    schedule TEXT NOT NULL DEFAULT '{}',
    max_students INTEGER NOT NULL DEFAULT 20,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS circle_students (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (circle_id) REFERENCES circles(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE(circle_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present','absent','excused')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (circle_id) REFERENCES circles(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS memorization (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    circle_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('new','revision')),
    surah INTEGER NOT NULL,
    verse_from INTEGER NOT NULL,
    verse_to INTEGER NOT NULL,
    evaluation TEXT NOT NULL CHECK(evaluation IN ('excellent','very_good','good','acceptable','weak')),
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (circle_id) REFERENCES circles(id)
  );

  CREATE TABLE IF NOT EXISTS parent_students (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE(parent_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    read INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (from_id) REFERENCES users(id),
    FOREIGN KEY (to_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('INSERT','UPDATE','DELETE')),
    record_id TEXT NOT NULL,
    data TEXT,
    synced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;
