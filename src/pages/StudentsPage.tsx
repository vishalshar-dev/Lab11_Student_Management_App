import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Plus, Users, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Course } from '@/types/admin';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import type { Gender, StudentInput } from '@/types/admin';

interface StudentsPageProps {
  onViewStudent: (id: string) => void;
}

export default function StudentsPage({ onViewStudent }: StudentsPageProps) {
  const { success, error: showError } = useToast();
  const [students, setStudents] = useState<(Student & { course_name?: string })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<StudentInput>({
    student_id: '',
    enrollment_number: '',
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    course_id: '',
    semester: 1,
    section: 'A',
    photo_url: '',
  });

  const fetchData = async () => {
    const [studentsRes, coursesRes] = await Promise.all([
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('name'),
    ]);

    const courseMap = new Map((coursesRes.data ?? []).map((c: Course) => [c.id, c.name]));
    setStudents((studentsRes.data ?? []).map((s) => ({ ...s, course_name: s.course_id ? courseMap.get(s.course_id) : undefined })));
    setCourses(coursesRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      s.enrollment_number.toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q) ||
      (s.course_name ?? '').toLowerCase().includes(q)
    );
  }, [students, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ student_id: '', enrollment_number: '', name: '', email: '', phone: '', date_of_birth: '', gender: 'male', address: '', course_id: courses[0]?.id ?? '', semester: 1, section: 'A', photo_url: '' });
    setFormOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      student_id: s.student_id, enrollment_number: s.enrollment_number, name: s.name,
      email: s.email ?? '', phone: s.phone ?? '', date_of_birth: s.date_of_birth ?? '',
      gender: s.gender ?? 'male', address: s.address ?? '', course_id: s.course_id ?? '',
      semester: s.semester, section: s.section ?? 'A', photo_url: s.photo_url ?? '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.student_id.trim() || !form.enrollment_number.trim()) {
      showError('Name, Student ID, and Enrollment Number are required');
      return;
    }
    setSubmitting(true);
    try {
      const data: StudentInput = {
        ...form,
        course_id: form.course_id || null,
        date_of_birth: form.date_of_birth || null,
        gender: (form.gender as Gender) || null,
        photo_url: form.photo_url || null,
      };
      if (editing) {
        const { error: err } = await supabase.from('students').update(data).eq('id', editing.id);
        if (err) throw err;
        success('Student updated successfully');
      } else {
        const { error: err } = await supabase.from('students').insert(data);
        if (err) throw err;
        success('Student added successfully');
      }
      setFormOpen(false);
      fetchData();
    } catch {
      showError('Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error: err } = await supabase.from('students').delete().eq('id', deleteId);
    setDeleting(false);
    if (err) { showError('Failed to delete student'); return; }
    success('Student deleted');
    setDeleteId(null);
    fetchData();
  };

  if (loading) return <LoadingSpinner message="Loading students..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, enrollment, email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Student</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={search ? 'No students found' : 'No students yet'}
          description={search ? 'Try a different search term' : 'Add your first student to get started'}
          action={!search && <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Student</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-500">Student</th>
                  <th className="px-5 py-3 font-bold text-slate-500">ID</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 lg:table-cell">Course</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 md:table-cell">Semester</th>
                  <th className="px-5 py-3 text-right font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-sm font-bold text-teal-700">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">{s.name}</p>
                          <p className="truncate text-xs text-slate-400">{s.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-600">{s.student_id}</p>
                      <p className="text-xs text-slate-400">{s.enrollment_number}</p>
                    </td>
                    <td className="hidden px-5 py-3 lg:table-cell">
                      {s.course_name ? <Badge variant="teal">{s.course_name}</Badge> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <Badge variant="slate">Sem {s.semester}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onViewStudent(s.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-teal-50 hover:text-teal-600" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Student' : 'Add Student'}
        subtitle="Enter student information below"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting} form="student-form" type="submit">{editing ? 'Save Changes' : 'Add Student'}</Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Student ID *" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} placeholder="STU001" />
          <Input label="Enrollment Number *" value={form.enrollment_number} onChange={(e) => setForm({ ...form, enrollment_number: e.target.value })} placeholder="ENR2026001" />
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
          <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          <Input label="Phone" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
          <Input label="Date of Birth" type="date" value={form.date_of_birth ?? ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          <Select label="Gender" value={form.gender ?? 'male'} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Select label="Course" value={form.course_id ?? ''} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">— Select Course —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.course_id})</option>)}
          </Select>
          <Input label="Semester" type="number" min={1} max={10} value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })} />
          <Input label="Section" value={form.section ?? ''} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="A" />
          <div className="sm:col-span-2">
            <Textarea label="Address" rows={2} value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City, State" />
          </div>
          <div className="sm:col-span-2">
            <Input label="Photo URL" value={form.photo_url ?? ''} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Student"
        message="Are you sure you want to delete this student? This will also remove all their attendance, marks, and enrollment records. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
