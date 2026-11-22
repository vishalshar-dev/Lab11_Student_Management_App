import { Calendar, Check, Clock, Flag, Trash2 } from 'lucide-react';
import type { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  low: {
    label: 'Low',
    dot: 'bg-emerald-400',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'border-l-emerald-400',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-400',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'border-l-amber-400',
  },
  high: {
    label: 'High',
    dot: 'bg-rose-400',
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    accent: 'border-l-rose-400',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getDeadlineStatus(deadline: string | null, completed: boolean): 'overdue' | 'soon' | 'normal' | null {
  if (!deadline || completed) return null;
  const now = new Date();
  const due = new Date(deadline);
  const diff = due.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  if (diff < 0) return 'overdue';
  if (hours <= 24) return 'soon';
  return 'normal';
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const deadlineStatus = getDeadlineStatus(task.deadline, task.completed);

  return (
    <div
      className={`group relative animate-fade-in-up overflow-hidden rounded-2xl border border-l-4 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 ${
        task.completed ? `border-slate-150 ${priority.accent} opacity-60` : `${priority.accent} border-slate-200/80`
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
            task.completed
              ? 'border-emerald-500 bg-emerald-500 shadow-sm shadow-emerald-200'
              : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
          }`}
          aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
        >
          {task.completed && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-[15px] font-semibold leading-snug transition-colors ${
              task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className={`mt-1 text-sm leading-relaxed ${task.completed ? 'text-slate-300' : 'text-slate-500'}`}>
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priority.bg} ${priority.text} ${priority.border}`}
            >
              <Flag className="h-3 w-3" />
              {priority.label}
            </span>

            {task.deadline && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  deadlineStatus === 'overdue'
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : deadlineStatus === 'soon'
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                {deadlineStatus === 'overdue' ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                {formatDate(task.deadline)} · {formatTime(task.deadline)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded-xl p-2 text-slate-300 opacity-0 transition-all duration-200 hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
