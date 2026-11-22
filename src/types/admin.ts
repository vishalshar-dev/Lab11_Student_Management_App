export interface Course {
  id: string;
  course_id: string;
  name: string;
  department: string;
  duration: number;
  num_semesters: number;
  created_at: string;
}

export interface CourseInput {
  course_id: string;
  name: string;
  department: string;
  duration: number;
  num_semesters: number;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  course_id: string | null;
  semester: number;
  credits: number;
  faculty: string;
  created_at: string;
}

export interface SubjectInput {
  subject_code: string;
  subject_name: string;
  course_id: string | null;
  semester: number;
  credits: number;
  faculty: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string;
  student_id: string;
  enrollment_number: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  address: string | null;
  course_id: string | null;
  semester: number;
  section: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface StudentInput {
  student_id: string;
  enrollment_number: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  address?: string | null;
  course_id?: string | null;
  semester?: number;
  section?: string | null;
  photo_url?: string | null;
}

export interface StudentSubject {
  id: string;
  student_id: string;
  subject_id: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
}

export interface MarkRecord {
  id: string;
  student_id: string;
  subject_id: string;
  internal_marks: number;
  assignment_marks: number;
  exam_marks: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_marks: number;
  created_at: string;
}
