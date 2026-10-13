import { IconCheck } from "./icons";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
      <IconCheck className="h-4 w-4 text-brand-300" />
      {message}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">Active</span>
  ) : (
    <span className="badge bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">Deactivated</span>
  );
}
