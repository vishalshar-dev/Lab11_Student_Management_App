import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Library } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Subject, SubjectInput, Course } from '@/types/admin';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Input, Select } from '@/components/ui/FormFields';

export default function SubjectsPage() {
  const { success, error: showError } = useToast();
  const [subjects, setSubjects] = useState<(Subject & { course_name?: string })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<SubjectInput>({ subject_code: '', subject_name: '', course_id: '', semester: 1, credits: 3, faculty: '' });

  const fetchData = async () => {
    const [subjectsRes, coursesRes] = await Promise.all([
      supabase.from('subjects').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('name'),
    ]);
    const courseMap = new Map((coursesRes.data as Course[] ?? []).map((c) => [c.id, c.name]));
    setSubjects((subjectsRes.data as Subject[] ?? []).map((s) => ({ ...s, course_name: s.course_id ? courseMap.get(s.course_id) : undefined })));
    setCourses(coursesRes.data as Course[] ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subjects.filter((s) => {
      if (courseFilter !== 'all' && s.course_id !== courseFilter) return false;
      if (q) {
        return s.subject_name.toLowerCase().includes(q) ||
          s.subject_code.toLowerCase().includes(q) ||
          s.faculty.toLowerCase().includes(q);
      }
      return true;
    });
  }, [subjects, search, courseFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ subject_code: '', subject_name: '', course_id: courses[0]?.id ?? '', semester: 1, credits: 3, faculty: '' });
    setFormOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ subject_code: s.subject_code, subject_name: s.subject_name, course_id: s.course_id ?? '', semester: s.semester, credits: s.credits, faculty: s.faculty });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_code.trim() || !form.subject_name.trim() || !form.faculty.trim()) {
      showError('Subject Code, Name, and Faculty are required');
      return;
    }
    setSubmitting(true);
    try {
      const data = { ...form, course_id: form.course_id || null };
      if (editing) {
        const { error: err } = await supabase.from('subjects').update(data).eq('id', editing.id);
        if (err) throw err;
        success('Subject updated successfully');
      } else {
        const { error: err } = await supabase.from('subjects').insert(data);
        if (err) throw err;
        success('Subject added successfully');
      }
      setFormOpen(false);
      fetchData();
    } catch {
      showError('Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error: err } = await supabase.from('subjects').delete().eq('id', deleteId);
    setDeleting(false);
    if (err) { showError('Failed to delete subject'); return; }
    success('Subject deleted');
    setDeleteId(null);
    fetchData();
  };

  if (loading) return <LoadingSpinner message="Loading subjects..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, faculty..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Subject</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Library className="h-8 w-8" />}
          title={search || courseFilter !== 'all' ? 'No subjects found' : 'No subjects yet'}
          description={search || courseFilter !== 'all' ? 'Try a different search or filter' : 'Add your first subject to get started'}
          action={!search && courseFilter === 'all' && <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Subject</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-500">Subject</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 md:table-cell">Course</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 sm:table-cell">Sem</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 lg:table-cell">Credits</th>
                  <th className="hidden px-5 py-3 font-bold text-slate-500 lg:table-cell">Faculty</th>
                  <th className="px-5 py-3 text-right font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600">
                          <Library className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{s.subject_name}</p>
                          <p className="text-xs text-slate-400">{s.subject_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      {s.course_name ? <Badge variant="sky">{s.course_name}</Badge> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell"><Badge variant="slate">Sem {s.semester}</Badge></td>
                    <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{s.credits}</td>
                    <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{s.faculty}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
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
        title={editing ? 'Edit Subject' : 'Add Subject'}
        subtitle="Enter subject details below"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editing ? 'Save Changes' : 'Add Subject'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Subject Code *" value={form.subject_code} onChange={(e) => setForm({ ...form, subject_code: e.target.value })} placeholder="CS101" />
          <Input label="Subject Name *" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} placeholder="Data Structures" />
          <Select label="Course" value={form.course_id ?? ''} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">— Select Course —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Semester" type="number" min={1} max={10} value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })} />
          <Input label="Credits" type="number" min={1} max={10} value={form.credits} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 1 })} />
          <Input label="Faculty *" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="Dr. Smith" />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? All related assignments will also be removed. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
