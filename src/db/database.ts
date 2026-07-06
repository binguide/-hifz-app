import SQLite from 'react-native-sqlite-storage';
import {CREATE_TABLES} from './schema';
import {generateId} from '../utils/helpers';
import {
  User,
  Circle,
  CircleStudent,
  Attendance,
  Memorization,
  ParentStudent,
  Message,
} from '../types';

SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabase({name: 'hifz.db', location: 'default'});
  await applySchema(db);
  await seedDemoData(db);
  return db;
}

async function applySchema(d: SQLite.SQLiteDatabase) {
  const statements = CREATE_TABLES
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await d.executeSql(statement);
  }
}

async function seedDemoData(d: SQLite.SQLiteDatabase) {
  const demoUsers = [
    ['demo-admin', 'Demo Admin', '1000', 'admin', '123456'],
    ['demo-teacher', 'Demo Teacher', '2000', 'teacher', '123456'],
    ['demo-student', 'Demo Student', '3000', 'student', '123456'],
    ['demo-parent', 'Demo Parent', '4000', 'parent', '123456'],
  ];

  for (const user of demoUsers) {
    await d.executeSql(
      `INSERT OR IGNORE INTO users (id, name, phone, role, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      user,
    );
  }

  await d.executeSql(
    `INSERT OR IGNORE INTO circles (id, name, teacher_id, schedule, max_students)
     VALUES (?, ?, ?, ?, ?)`,
    ['demo-circle', 'Demo Circle', 'demo-teacher', '{}', 20],
  );
  await d.executeSql(
    'INSERT OR IGNORE INTO circle_students (id, circle_id, student_id) VALUES (?, ?, ?)',
    ['demo-circle-student', 'demo-circle', 'demo-student'],
  );
  await d.executeSql(
    'INSERT OR IGNORE INTO parent_students (id, parent_id, student_id) VALUES (?, ?, ?)',
    ['demo-parent-student', 'demo-parent', 'demo-student'],
  );
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

export async function addUser(user: Omit<User, 'created_at'>) {
  const d = await getDatabase();
  await d.executeSql(
    `INSERT OR REPLACE INTO users (id, name, phone, role, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, user.name, user.phone, user.role, user.password_hash],
  );
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    'SELECT * FROM users WHERE phone = ?',
    [phone],
  );
  if (results.rows.length === 0) return null;
  return results.rows.item(0) as User;
}

export async function getUser(id: string): Promise<User | null> {
  const d = await getDatabase();
  const [results] = await d.executeSql('SELECT * FROM users WHERE id = ?', [id]);
  if (results.rows.length === 0) return null;
  return results.rows.item(0) as User;
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql('SELECT * FROM users WHERE role = ?', [role]);
  const users: User[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    users.push(results.rows.item(i) as User);
  }
  return users;
}

export async function addCircle(circle: Omit<Circle, 'created_at'>) {
  const d = await getDatabase();
  await d.executeSql(
    `INSERT OR REPLACE INTO circles (id, name, teacher_id, schedule, max_students)
     VALUES (?, ?, ?, ?, ?)`,
    [circle.id, circle.name, circle.teacher_id, circle.schedule, circle.max_students],
  );
}

export async function getCircles(): Promise<Circle[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql('SELECT * FROM circles');
  const circles: Circle[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    circles.push(results.rows.item(i) as Circle);
  }
  return circles;
}

export async function getCirclesByTeacher(teacherId: string): Promise<Circle[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    'SELECT * FROM circles WHERE teacher_id = ?',
    [teacherId],
  );
  const circles: Circle[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    circles.push(results.rows.item(i) as Circle);
  }
  return circles;
}

export async function getCircle(id: string): Promise<Circle | null> {
  const d = await getDatabase();
  const [results] = await d.executeSql('SELECT * FROM circles WHERE id = ?', [id]);
  if (results.rows.length === 0) return null;
  return results.rows.item(0) as Circle;
}

export async function deleteCircle(id: string) {
  const d = await getDatabase();
  await d.executeSql('DELETE FROM attendance WHERE circle_id = ?', [id]);
  await d.executeSql('DELETE FROM memorization WHERE circle_id = ?', [id]);
  await d.executeSql('DELETE FROM circle_students WHERE circle_id = ?', [id]);
  await d.executeSql('DELETE FROM circles WHERE id = ?', [id]);
}

export async function addCircleStudent(circleId: string, studentId: string) {
  const d = await getDatabase();
  const id = generateId();
  await d.executeSql(
    'INSERT OR IGNORE INTO circle_students (id, circle_id, student_id) VALUES (?, ?, ?)',
    [id, circleId, studentId],
  );
}

export async function removeCircleStudent(circleId: string, studentId: string) {
  const d = await getDatabase();
  await d.executeSql(
    'DELETE FROM circle_students WHERE circle_id = ? AND student_id = ?',
    [circleId, studentId],
  );
}

export async function getCircleStudents(circleId: string): Promise<User[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    `SELECT u.* FROM users u
     INNER JOIN circle_students cs ON cs.student_id = u.id
     WHERE cs.circle_id = ?`,
    [circleId],
  );
  const students: User[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    students.push(results.rows.item(i) as User);
  }
  return students;
}

export async function addAttendance(record: Omit<Attendance, 'created_at'>) {
  const d = await getDatabase();
  await d.executeSql(
    `INSERT OR REPLACE INTO attendance (id, circle_id, student_id, date, status)
     VALUES (?, ?, ?, ?, ?)`,
    [record.id, record.circle_id, record.student_id, record.date, record.status],
  );
}

export async function getAttendanceByDate(circleId: string, date: string): Promise<Attendance[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    'SELECT * FROM attendance WHERE circle_id = ? AND date = ?',
    [circleId, date],
  );
  const records: Attendance[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    records.push(results.rows.item(i) as Attendance);
  }
  return records;
}

export async function addMemorization(record: Omit<Memorization, 'created_at'>) {
  const d = await getDatabase();
  await d.executeSql(
    `INSERT INTO memorization (id, student_id, circle_id, date, type, surah, verse_from, verse_to, evaluation, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id, record.student_id, record.circle_id, record.date,
      record.type, record.surah, record.verse_from, record.verse_to,
      record.evaluation, record.notes,
    ],
  );
}

export async function getMemorizationByStudent(studentId: string): Promise<Memorization[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    'SELECT * FROM memorization WHERE student_id = ? ORDER BY date DESC, created_at DESC',
    [studentId],
  );
  const records: Memorization[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    records.push(results.rows.item(i) as Memorization);
  }
  return records;
}

export async function getMemorizationByCircle(
  circleId: string,
  date: string,
): Promise<Memorization[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    'SELECT * FROM memorization WHERE circle_id = ? AND date = ? ORDER BY surah, verse_from',
    [circleId, date],
  );
  const records: Memorization[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    records.push(results.rows.item(i) as Memorization);
  }
  return records;
}

export async function addParentStudent(parentId: string, studentId: string) {
  const d = await getDatabase();
  const id = generateId();
  await d.executeSql(
    'INSERT OR IGNORE INTO parent_students (id, parent_id, student_id) VALUES (?, ?, ?)',
    [id, parentId, studentId],
  );
}

export async function getChildrenByParent(parentId: string): Promise<User[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    `SELECT u.* FROM users u
     INNER JOIN parent_students ps ON ps.student_id = u.id
     WHERE ps.parent_id = ?`,
    [parentId],
  );
  const children: User[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    children.push(results.rows.item(i) as User);
  }
  return children;
}

export async function addMessage(message: Omit<Message, 'created_at'>) {
  const d = await getDatabase();
  await d.executeSql(
    'INSERT INTO messages (id, from_id, to_id, content, read) VALUES (?, ?, ?, ?, ?)',
    [message.id, message.from_id, message.to_id, message.content, message.read ? 1 : 0],
  );
}

export async function getMessages(userId: string): Promise<Message[]> {
  const d = await getDatabase();
  const [results] = await d.executeSql(
    'SELECT * FROM messages WHERE from_id = ? OR to_id = ? ORDER BY created_at DESC',
    [userId, userId],
  );
  const messages: Message[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    messages.push(results.rows.item(i) as Message);
  }
  return messages;
}

export async function markMessageRead(messageId: string) {
  const d = await getDatabase();
  await d.executeSql('UPDATE messages SET read = 1 WHERE id = ?', [messageId]);
}
