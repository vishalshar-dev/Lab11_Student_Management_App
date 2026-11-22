import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <p className="mt-3 text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}
