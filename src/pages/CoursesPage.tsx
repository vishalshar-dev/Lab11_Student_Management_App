import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course, CourseInput } from '@/types/admin';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/FormFields';

export default function CoursesPage() {
  const { success, error: showError } = useToast();
  const [courses, setCourses] = useState<(Course & { student_count?: number; subject_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CourseInput>({ course_id: '', name: '', department: '', duration: 3, num_semesters: 6 });

  const fetchData = async () => {
    const [coursesRes, studentsRes, subjectsRes] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('students').select('course_id'),
      supabase.from('subjects').select('course_id'),
    ]);

    const studentCounts = new Map<string, number>();
    (studentsRes.data ?? []).forEach((s) => {
      if (s.course_id) studentCounts.set(s.course_id, (studentCounts.get(s.course_id) ?? 0) + 1);
    });
    const subjectCounts = new Map<string, number>();
    (subjectsRes.data ?? []).forEach((s) => {
      if (s.course_id) subjectCounts.set(s.course_id, (subjectCounts.get(s.course_id) ?? 0) + 1);
    });

    setCourses((coursesRes.data as Course[] ?? []).map((c) => ({
      ...c,
      student_count: studentCounts.get(c.id) ?? 0,
      subject_count: subjectCounts.get(c.id) ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.course_id.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ course_id: '', name: '', department: '', duration: 3, num_semesters: 6 });
    setFormOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ course_id: c.course_id, name: c.name, department: c.department, duration: c.duration, num_semesters: c.num_semesters });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.course_id.trim() || !form.department.trim()) {
      showError('Course ID, Name, and Department are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        const { error: err } = await supabase.from('courses').update(form).eq('id', editing.id);
        if (err) throw err;
        success('Course updated successfully');
      } else {
        const { error: err } = await supabase.from('courses').insert(form);
        if (err) throw err;
        success('Course added successfully');
      }
      setFormOpen(false);
      fetchData();
    } catch {
      showError('Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error: err } = await supabase.from('courses').delete().eq('id', deleteId);
    setDeleting(false);
    if (err) { showError('Failed to delete course'); return; }
    success('Course deleted');
    setDeleteId(null);
    fetchData();
  };

  if (loading) return <LoadingSpinner message="Loading courses..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by name, ID, department..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Course</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={search ? 'No courses found' : 'No courses yet'}
          description={search ? 'Try a different search term' : 'Add your first course to get started'}
          action={!search && <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Course</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-500">Course</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 md:table-cell">Department</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 lg:table-cell">Duration</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 lg:table-cell">Semesters</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 sm:table-cell">Students</th>
                  <th className="px-5 py-3 text-right font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.course_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-slate-600 md:table-cell">{c.department}</td>
                    <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{c.duration} years</td>
                    <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{c.num_semesters}</td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <Badge variant="teal"><Users className="h-3 w-3" /> {c.student_count ?? 0}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
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

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Course' : 'Add Course'}
        subtitle="Enter course details below"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editing ? 'Save Changes' : 'Add Course'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Course ID *" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} placeholder="BCA" />
          <Input label="Course Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bachelor of Computer Applications" />
          <Input label="Department *" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
          <Input label="Duration (years)" type="number" min={1} max={10} value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 1 })} />
          <Input label="Number of Semesters" type="number" min={1} max={20} value={form.num_semesters} onChange={(e) => setForm({ ...form, num_semesters: parseInt(e.target.value) || 1 })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Course"
        message="Are you sure you want to delete this course? All subjects under this course will also be removed. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
