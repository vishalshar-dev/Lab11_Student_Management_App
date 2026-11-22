import { useEffect, useState } from 'react';
import {
  ArrowLeft, Mail, Phone, Calendar, MapPin, User, CreditCard, BookOpen,
  GraduationCap, Pencil, CheckCircle2, Clock, TrendingUp, FileText, Award,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Course, Subject, MarkRecord, AttendanceRecord, Assignment } from '@/types/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Tab = 'overview' | 'attendance' | 'marks' | 'subjects' | 'assignments';

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'marks', label: 'Marks' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'assignments', label: 'Assignments' },
];

function calcGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentProfile({ studentId, onBack }: StudentProfileProps) {
  const [student, setStudent] = useState<(Student & { course?: Course }) | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<(Assignment & { subject_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    (async () => {
      const { data: sData } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
      if (!sData) { setLoading(false); return; }

      let course: Course | undefined;
      if (sData.course_id) {
        const { data: cData } = await supabase.from('courses').select('*').eq('id', sData.course_id).maybeSingle();
        course = cData as Course;
      }
      setStudent({ ...(sData as Student), course });

      // Get enrolled subjects
      const { data: ssData } = await supabase.from('student_subjects').select('subject_id').eq('student_id', studentId);
      const subjectIds = (ssData ?? []).map((ss) => ss.subject_id);
      if (subjectIds.length > 0) {
        const { data: subData } = await supabase.from('subjects').select('*').in('id', subjectIds);
        setSubjects(subData as Subject[] ?? []);
      }

      // If no enrolled subjects, load subjects for the student's course/semester
      if (subjectIds.length === 0 && sData.course_id) {
        const { data: courseSubs } = await supabase.from('subjects').select('*').eq('course_id', sData.course_id).eq('semester', sData.semester);
        setSubjects(courseSubs as Subject[] ?? []);
      }

      const { data: mData } = await supabase.from('marks').select('*').eq('student_id', studentId);
      setMarks(mData as MarkRecord[] ?? []);

      const { data: aData } = await supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false });
      setAttendance(aData as AttendanceRecord[] ?? []);

      // Assignments for enrolled subjects
      if (subjectIds.length > 0) {
        const { data: asgData } = await supabase.from('assignments').select('*').in('subject_id', subjectIds).order('due_date', { ascending: false });
        const subMap = new Map(subjects.map((s) => [s.id, s.subject_name]));
        setAssignments((asgData as Assignment[] ?? []).map((a) => ({ ...a, subject_name: subMap.get(a.subject_id) })));
      }

      setLoading(false);
    })();
  }, [studentId]);

  if (loading) return <LoadingSpinner message="Loading student profile..." />;
  if (!student) return <div className="py-20 text-center text-slate-400">Student not found</div>;

  // Calculate overall percentage from marks
  const overallMarks = marks.length > 0
    ? marks.reduce((sum, m) => sum + (m.internal_marks + m.assignment_marks + m.exam_marks) / 3, 0) / marks.length
    : 0;
  const overallPercentage = Math.round(overallMarks);
  const grade = calcGrade(overallPercentage);

  // Attendance percentage
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const profileInfo = [
    { label: 'Student ID', value: student.student_id, icon: CreditCard },
    { label: 'Enrollment No.', value: student.enrollment_number, icon: FileText },
    { label: 'Email', value: student.email ?? '—', icon: Mail },
    { label: 'Phone', value: student.phone ?? '—', icon: Phone },
    { label: 'Date of Birth', value: formatDate(student.date_of_birth), icon: Calendar },
    { label: 'Gender', value: student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—', icon: User },
    { label: 'Address', value: student.address ?? '—', icon: MapPin },
    { label: 'Course', value: student.course?.name ?? '—', icon: BookOpen },
    { label: 'Semester', value: `Semester ${student.semester}`, icon: GraduationCap },
    { label: 'Section', value: student.section ?? '—', icon: User },
  ];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-600">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      {/* Profile header card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-teal-100 to-emerald-100 text-3xl font-extrabold text-teal-700 shadow-lg">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  student.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-extrabold text-slate-800">{student.name}</h2>
                <p className="text-sm text-slate-400">{student.course?.name ?? 'No course assigned'} · Semester {student.semester}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />}>Edit Profile</Button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Student info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-base font-bold text-slate-800">Student Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profileInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.label} className="flex items-start gap-3 rounded-xl bg-slate-50/60 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{info.label}</p>
                      <p className="truncate text-sm font-semibold text-slate-700">{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-800">Academic Summary</h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 p-4 text-center">
                  <p className="text-4xl font-extrabold text-teal-700">{overallPercentage}%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Overall Percentage</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50/60 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-500" />
                      <p className="text-2xl font-extrabold text-slate-800">{grade}</p>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">Grade</p>
                  </div>
                  <div className="rounded-xl bg-slate-50/60 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <p className="text-2xl font-extrabold text-slate-800">{attendancePct}%</p>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">Attendance</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Subjects Enrolled</span>
                    <Badge variant="teal">{subjects.length}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Attendance Records</h3>
            {attendance.length > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant={attendancePct >= 75 ? 'emerald' : attendancePct >= 50 ? 'amber' : 'rose'}>
                  {attendancePct}% Overall
                </Badge>
              </div>
            )}
          </div>
          {attendance.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No attendance records found</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 font-bold text-slate-500">Date</th>
                    <th className="py-2.5 font-bold text-slate-500">Subject</th>
                    <th className="py-2.5 font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((rec) => {
                    const sub = subjects.find((s) => s.id === rec.subject_id);
                    return (
                      <tr key={rec.id}>
                        <td className="py-3 text-slate-600">{formatDate(rec.date)}</td>
                        <td className="py-3 text-slate-600">{sub?.subject_name ?? '—'}</td>
                        <td className="py-3">
                          <Badge variant={rec.status === 'present' ? 'emerald' : rec.status === 'late' ? 'amber' : 'rose'}>
                            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-800">Marks Breakdown</h3>
          {marks.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No marks records found</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 font-bold text-slate-500">Subject</th>
                    <th className="py-2.5 text-center font-bold text-slate-500">Internal</th>
                    <th className="py-2.5 text-center font-bold text-slate-500">Assignment</th>
                    <th className="py-2.5 text-center font-bold text-slate-500">Exam</th>
                    <th className="py-2.5 text-center font-bold text-slate-500">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {marks.map((m) => {
                    const sub = subjects.find((s) => s.id === m.subject_id);
                    const avg = Math.round((m.internal_marks + m.assignment_marks + m.exam_marks) / 3);
                    return (
                      <tr key={m.id}>
                        <td className="py-3 font-semibold text-slate-700">{sub?.subject_name ?? '—'}</td>
                        <td className="py-3 text-center text-slate-600">{m.internal_marks}</td>
                        <td className="py-3 text-center text-slate-600">{m.assignment_marks}</td>
                        <td className="py-3 text-center text-slate-600">{m.exam_marks}</td>
                        <td className="py-3 text-center">
                          <Badge variant={avg >= 75 ? 'emerald' : avg >= 50 ? 'amber' : 'rose'}>{avg}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-800">Enrolled Subjects</h3>
          {subjects.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No subjects enrolled</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {subjects.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{s.subject_name}</p>
                      <p className="text-xs text-slate-400">{s.subject_code}</p>
                    </div>
                    <Badge variant="teal">{s.credits} cr</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {s.faculty}</span>
                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Sem {s.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-800">Assignments</h3>
          {assignments.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No assignments found</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{a.title}</p>
                    {a.description && <p className="mt-0.5 text-sm text-slate-500">{a.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {a.subject_name && <Badge variant="slate">{a.subject_name}</Badge>}
                      <Badge variant="amber">Max {a.max_marks}</Badge>
                      {a.due_date && <Badge variant="rose">Due {formatDate(a.due_date)}</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
