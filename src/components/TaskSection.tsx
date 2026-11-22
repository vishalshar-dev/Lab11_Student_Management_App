import { ClipboardList, CheckCircle2 } from 'lucide-react';
import type { Task } from '@/types/task';
import TaskCard from './TaskCard';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  completed: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export default function TaskSection({ title, tasks, completed, onToggle, onDelete }: TaskSectionProps) {
  const Icon = completed ? CheckCircle2 : ClipboardList;
  const count = tasks.length;

  return (
    <div className={`rounded-2xl p-5 transition-all ${completed ? 'bg-slate-50/60' : 'bg-white/60'} backdrop-blur-sm`}>
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
            completed
              ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600'
              : 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-400">
            {count} {count === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        {count > 0 && (
          <span
            className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2.5 text-xs font-bold ${
              completed ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-100 text-teal-600'
            }`}
          >
            {count}
          </span>
        )}
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-400">
            {completed ? 'No completed tasks yet' : 'No pending tasks — add one above!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={task.id} style={{ animationDelay: `${index * 40}ms` }}>
              <TaskCard
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
