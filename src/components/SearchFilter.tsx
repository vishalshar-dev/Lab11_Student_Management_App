import { Search, X } from 'lucide-react';
import type { Priority } from '@/types/task';

export type StatusFilter = 'all' | 'pending' | 'completed';
export type PriorityFilter = 'all' | Priority;

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  totalCount: number;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const priorityStyles: Record<string, { active: string }> = {
  all: { active: 'bg-slate-700 text-white shadow-sm' },
  high: { active: 'bg-rose-500 text-white shadow-sm shadow-rose-200' },
  medium: { active: 'bg-amber-500 text-white shadow-sm shadow-amber-200' },
  low: { active: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' },
};

const priorityOptions: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function SearchFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  totalCount,
}: SearchFilterProps) {
  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all';

  const clearAll = () => {
    onSearchChange('');
    onStatusChange('all');
    onPriorityChange('all');
  };

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${totalCount} ${totalCount === 1 ? 'task' : 'tasks'}...`}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-0.5 text-slate-400 transition-all hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</span>
          <div className="flex gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  statusFilter === opt.value
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm shadow-teal-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Priority</span>
          <div className="flex gap-1.5">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onPriorityChange(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  priorityFilter === opt.value
                    ? priorityStyles[opt.value].active
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-400">Filters active</p>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-rose-500"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
