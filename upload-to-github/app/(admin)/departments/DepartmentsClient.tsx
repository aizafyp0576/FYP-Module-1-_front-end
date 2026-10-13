"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { FormError, PageHeader, Toast } from "@/components/Feedback";
import { IconBuilding, IconPencil, IconPlus } from "@/components/icons";
import { useAction } from "@/components/useAction";
import type { Department } from "@/lib/types";
import { saveDepartment } from "../actions";

type Row = Department & { staff: number; stages: string[] };

export default function DepartmentsClient({ rows }: { rows: Row[] }) {
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const { pending, error, setError, toast, run } = useAction();
  const close = () => {
    setEditing(null);
    setError(null);
  };
  const current = editing && editing !== "new" ? editing : null;

  return (
    <>
      <PageHeader
        title="Departments"
        description="The factory departments that staff belong to and production stages run in."
        action={
          <button className="btn-primary" onClick={() => setEditing("new")}>
            <IconPlus className="h-4 w-4" /> Add department
          </button>
        }
      />

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">No departments yet. Add your first one.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((d) => (
            <article key={d.department_id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-brand-50 p-2 text-brand-600"><IconBuilding className="h-5 w-5" /></span>
                  <h2 className="font-semibold text-slate-900">{d.department_name}</h2>
                </div>
                <button className="btn-ghost -mr-2 -mt-1" onClick={() => setEditing(d)} aria-label={`Edit ${d.department_name}`}>
                  <IconPencil className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 flex-1 text-sm text-slate-500">{d.description || "No description."}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
                <span className="badge bg-slate-100 text-slate-700">{d.staff} active staff</span>
                {d.stages.map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={editing !== null} title={current ? "Edit department" : "Add department"} onClose={close}>
        <form
          key={current?.department_id ?? "new"}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => saveDepartment(fd), close);
          }}
        >
          {current && <input type="hidden" name="department_id" value={current.department_id} />}
          <div>
            <label htmlFor="dn" className="label">Department name</label>
            <input id="dn" name="department_name" required className="input" defaultValue={current?.department_name} placeholder="e.g. Dyeing" />
          </div>
          <div>
            <label htmlFor="dd" className="label">Description <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea id="dd" name="description" rows={3} className="input" defaultValue={current?.description ?? ""} />
          </div>
          <FormError message={error} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={close} disabled={pending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving…" : current ? "Save changes" : "Add department"}</button>
          </div>
        </form>
      </Modal>
      <Toast message={toast} />
    </>
  );
}
