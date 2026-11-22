import { useEffect, useState } from 'react';
import { Users, BookOpen, Library, CheckSquare, TrendingUp, Clock, CheckCircle2, Target, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PageKey } from '@/components/AppLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

interface Stats {
  studentCount: number;
  courseCount: number;
  subjectCount: number;
  taskCount: number;
  pendingTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [students, courses, subjects, tasks] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('*'),
      ]);

      const taskData = tasks.data ?? [];
      setStats({
        studentCount: students.count ?? 0,
        courseCount: courses.count ?? 0,
        subjectCount: subjects.count ?? 0,
        taskCount: taskData.length,
        pendingTasks: taskData.filter((t) => !t.completed).length,
        completedTasks: taskData.filter((t) => t.completed).length,
        highPriorityTasks: taskData.filter((t) => t.priority === 'high' && !t.completed).length,
      });
      setLoading(false);
    })();
  }, []);

  if (loading || !stats) return <LoadingSpinner message="Loading dashboard..." />;

  const cards = [
    { label: 'Total Students', value: stats.studentCount, icon: Users, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50', text: 'text-teal-600', page: 'students' as PageKey },
    { label: 'Active Courses', value: stats.courseCount, icon: BookOpen, color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50', text: 'text-sky-600', page: 'courses' as PageKey },
    { label: 'Subjects', value: stats.subjectCount, icon: Library, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', page: 'subjects' as PageKey },
    { label: 'Total Tasks', value: stats.taskCount, icon: CheckSquare, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600', page: 'tasks' as PageKey },
  ];

  const taskStats = [
    { label: 'Pending', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'High Priority', value: stats.highPriorityTasks, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white shadow-xl shadow-teal-200/40">
        <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-1/3 h-32 w-32 translate-y-8 rounded-full bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold">Welcome to EduAdmin</h2>
          <p className="mt-1 max-w-lg text-sm text-teal-50">
            Your complete college administration dashboard. Manage students, courses, subjects, and tasks — all in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
            >
              View Students <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
            >
              Manage Courses <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.page)}
              className="animate-fade-in-up group rounded-2xl border border-slate-200/60 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/40"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.text} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800">{card.value}</p>
              <p className="text-sm font-medium text-slate-400">{card.label}</p>
            </button>
          );
        })}
      </div>

      {/* Task overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Task Overview</h3>
          </div>
          <div className="space-y-3">
            {taskStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-between rounded-xl bg-slate-50/60 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                  </div>
                  <span className="text-xl font-extrabold text-slate-800">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Student', desc: 'Enroll a new student', page: 'students' as PageKey },
              { label: 'Create Course', desc: 'Add a new course', page: 'courses' as PageKey },
              { label: 'Add Subject', desc: 'Define a new subject', page: 'subjects' as PageKey },
              { label: 'Create Task', desc: 'Add a new task', page: 'tasks' as PageKey },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.page)}
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-teal-300 hover:bg-teal-50/30"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700">{action.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-teal-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
