import { useState } from 'react';
import { Calendar, Flag, Plus, X, Sparkles } from 'lucide-react';
import type { Priority, TaskInput } from '@/types/task';

interface TaskFormProps {
  onAdd: (task: TaskInput) => Promise<void>;
}

const priorityConfig: Record<Priority, { label: string; active: string; dot: string }> = {
  low: {
    label: 'Low',
    active: 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200',
    dot: 'bg-emerald-400',
  },
  medium: {
    label: 'Medium',
    active: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200',
    dot: 'bg-amber-400',
  },
  high: {
    label: 'High',
    active: 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200',
    dot: 'bg-rose-400',
  },
};

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority,
      });
      reset();
      setOpen(false);
    } catch {
      setError('Failed to add task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-5 text-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-teal-400 hover:bg-teal-50/40 hover:text-teal-600 hover:shadow-lg hover:shadow-teal-100/50"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-teal-50/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        <span className="font-semibold">Add a new task</span>
        <Sparkles className="h-4 w-4 text-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-scale-in rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <Plus className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">New Task</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-xl p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-700">
            Task title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish calculus assignment"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes or details..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="deadline" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Calendar className="h-4 w-4 text-slate-400" />
              Deadline
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="priority" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Flag className="h-4 w-4 text-slate-400" />
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    priority === p
                      ? priorityConfig[p].active
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${priorityConfig[p].dot}`} />
                  <span className="capitalize">{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="animate-fade-in rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-teal-200/50 transition-all hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-teal-300/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add task'}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
