import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className = '', ...rest }: InputProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 ${icon ? 'pl-10' : ''} ${error ? 'border-rose-300' : 'border-slate-200'} ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...rest }: SelectProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <select
        className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 ${error ? 'border-rose-300' : 'border-slate-200'} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...rest }: TextareaProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <textarea
        className={`w-full resize-none rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 ${error ? 'border-rose-300' : 'border-slate-200'} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
