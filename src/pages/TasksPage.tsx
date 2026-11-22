import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, GraduationCap, Target, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Task, TaskInput } from '@/types/task';
import TaskForm from '@/components/TaskForm';
import TaskSection from '@/components/TaskSection';
import SearchFilter, { type StatusFilter, type PriorityFilter } from '@/components/SearchFilter';
import { useToast } from '@/components/ui/Toast';

export default function TasksPage() {
  const { success, error: showError } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  const fetchTasks = async () => {
    const { data, error: queryError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError('Failed to load tasks. Please refresh the page.');
      return;
    }
    setTasks(data as Task[]);
    setError(null);
  };

  useEffect(() => {
    (async () => {
      await fetchTasks();
      setLoading(false);
    })();
  }, []);

  const handleAdd = async (task: TaskInput) => {
    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (insertError) throw insertError;
    setTasks((prev) => [data as Task, ...prev]);
    success('Task added successfully');
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id);

    if (updateError) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
      showError('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setTasks(previous);
      showError('Failed to delete task');
      return;
    }
    success('Task deleted');
  };

  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return 0;
      if (!a.deadline && !b.deadline) return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedTasks.filter((t) => {
      if (statusFilter === 'pending' && t.completed) return false;
      if (statusFilter === 'completed' && !t.completed) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (query) {
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [sortedTasks, search, statusFilter, priorityFilter]);

  const showPending = statusFilter === 'all' || statusFilter === 'pending';
  const showCompleted = statusFilter === 'all' || statusFilter === 'completed';

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const totalTasks = tasks.length;
  const completedCount = sortedTasks.filter((t) => t.completed).length;
  const pendingCount = totalTasks - completedCount;
  const highPriorityCount = sortedTasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all';
  const noResults = filteredTasks.length === 0;

  const stats = [
    { label: 'Total', value: totalTasks, icon: Target, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Done', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'High Priority', value: highPriorityCount, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex animate-fade-in items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-sm font-semibold text-rose-500 hover:text-rose-700">Dismiss</button>
        </div>
      )}

      {totalTasks > 0 && !loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="animate-fade-in-up rounded-2xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm" style={{ animationDelay: `${index * 60}ms` }}>
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {totalTasks > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white/70 p-3 backdrop-blur-sm">
          <span className="text-sm font-semibold text-slate-600">{completedCount}/{totalTasks} completed</span>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-bold text-teal-600">{progress}%</span>
        </div>
      )}

      <TaskForm onAdd={handleAdd} />

      {totalTasks > 0 && (
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          totalCount={totalTasks}
        />
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="mt-3 text-sm font-medium text-slate-400">Loading your tasks...</p>
        </div>
      ) : noResults && hasFilters ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-500">No tasks match your filters</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : totalTasks === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 py-20 text-center backdrop-blur-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-500">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-700">No tasks yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-400">Start by adding your first task above. Set deadlines, priorities, and track your progress.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {showPending && (
            <TaskSection title="Pending" tasks={pendingTasks} completed={false} onToggle={handleToggle} onDelete={handleDelete} />
          )}
          {showCompleted && completedTasks.length > 0 && (
            <TaskSection title="Completed" tasks={completedTasks} completed={true} onToggle={handleToggle} onDelete={handleDelete} />
          )}
        </div>
      )}
    </div>
  );
}
