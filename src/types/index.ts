export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export type MemorizationType = 'new' | 'revision';

export type EvaluationGrade = 'excellent' | 'very_good' | 'good' | 'acceptable' | 'weak';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password_hash: string;
  created_at: string;
}

export interface Circle {
  id: string;
  name: string;
  teacher_id: string;
  schedule: string;
  max_students: number;
  created_at: string;
}

export interface CircleStudent {
  id: string;
  circle_id: string;
  student_id: string;
  joined_at: string;
}

export interface Attendance {
  id: string;
  circle_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface Memorization {
  id: string;
  student_id: string;
  circle_id: string;
  date: string;
  type: MemorizationType;
  surah: number;
  verse_from: number;
  verse_to: number;
  evaluation: EvaluationGrade;
  notes: string;
  created_at: string;
}

export interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
}

export interface Message {
  id: string;
  from_id: string;
  to_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export const EVALUATION_LABELS: Record<EvaluationGrade, string> = {
  excellent: 'ممتاز',
  very_good: 'جيد جداً',
  good: 'جيد',
  acceptable: 'مقبول',
  weak: 'ضعيف',
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'حاضر',
  absent: 'غائب',
  excused: 'معذر',
};

export const SURAH_NAMES: string[] = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام',
  'الأعراف', 'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف',
  'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف',
  'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور',
  'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس',
  'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى',
  'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح',
  'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر',
  'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم',
  'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن',
  'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ',
  'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق',
  'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
  'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر',
  'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر',
  'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس',
];

export const SURAH_VERSE_COUNT: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111,
  43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64,
  77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83,
  182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29,
  18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28,
  20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25,
  22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19,
  5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
];
