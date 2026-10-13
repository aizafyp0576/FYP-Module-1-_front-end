"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { FormError, PageHeader, Toast } from "@/components/Feedback";
import { IconPencil, IconPlus } from "@/components/icons";
import { useAction } from "@/components/useAction";
import type { Department, ProductionStage } from "@/lib/types";
import { saveStage } from "../actions";

export default function TargetsClient({ stages, departments }: { stages: ProductionStage[]; departments: Department[] }) {
  const [editing, setEditing] = useState<ProductionStage | "new" | null>(null);
  const { pending, error, setError, toast, run } = useAction();
  const close = () => {
    setEditing(null);
    setError(null);
  };
  const current = editing && editing !== "new" ? editing : null;
  const deptName = (id: number | null) => departments.find((d) => d.department_id === id)?.department_name ?? "—";
  const total = stages.reduce((s, x) => s + Number(x.target_duration_hrs), 0);
  const nextSeq = stages.length ? Math.max(...stages.map((s) => s.stage_sequence)) + 1 : 1;

  return (
    <>
      <PageHeader
        title="Processing Targets"
        description="Standard time each production stage should take. Later modules flag a batch as delayed when it goes over this target."
        action={
          <button className="btn-primary" onClick={() => setEditing("new")}>
            <IconPlus className="h-4 w-4" /> Add stage
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="th w-16">Step</th>
                <th className="th">Stage</th>
                <th className="th">Department</th>
                <th className="th text-right">Target time</th>
                <th className="th w-40">Share of total</th>
                <th className="th text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stages.length === 0 && (
                <tr><td colSpan={6} className="td py-10 text-center text-slate-500">No production stages yet.</td></tr>
              )}
              {stages.map((s) => {
                const hrs = Number(s.target_duration_hrs);
                return (
                  <tr key={s.stage_id}>
                    <td className="td">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{s.stage_sequence}</span>
                    </td>
                    <td className="td font-medium text-slate-900">{s.stage_name}</td>
                    <td className="td">{deptName(s.department_id)}</td>
                    <td className="td whitespace-nowrap text-right tabular-nums">
                      <span className="font-semibold text-slate-900">{hrs}</span> hrs
                    </td>
                    <td className="td">
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${total ? (hrs / total) * 100 : 0}%` }} />
                      </div>
                    </td>
                    <td className="td text-right">
                      <button className="btn-ghost" onClick={() => setEditing(s)}>
                        <IconPencil className="h-4 w-4" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {stages.length > 0 && (
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="td" colSpan={3}><span className="font-medium text-slate-900">Total order-to-dispatch target</span></td>
                  <td className="td whitespace-nowrap text-right tabular-nums"><span className="font-semibold text-slate-900">{total}</span> hrs</td>
                  <td className="td text-xs text-slate-500" colSpan={2}>≈ {(total / 24).toFixed(1)} days</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <Modal open={editing !== null} title={current ? `Edit “${current.stage_name}”` : "Add production stage"} onClose={close}>
        <form
          key={current?.stage_id ?? "new"}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => saveStage(fd), close);
          }}
        >
          {current && <input type="hidden" name="stage_id" value={current.stage_id} />}
          <div>
            <label htmlFor="sn" className="label">Stage name</label>
            <input id="sn" name="stage_name" required className="input" defaultValue={current?.stage_name} placeholder="e.g. Dyeing" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sq" className="label">Step number</label>
              <input id="sq" name="stage_sequence" type="number" min={1} step={1} required className="input" defaultValue={current?.stage_sequence ?? nextSeq} />
            </div>
            <div>
              <label htmlFor="th" className="label">Target time (hours)</label>
              <input id="th" name="target_duration_hrs" type="number" min={0.25} step={0.25} required className="input" defaultValue={current ? Number(current.target_duration_hrs) : ""} />
            </div>
          </div>
          <div>
            <label htmlFor="sd" className="label">Performed by department</label>
            <select id="sd" name="department_id" className="input" defaultValue={current?.department_id ?? ""}>
              <option value="">None</option>
              {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
            </select>
          </div>
          <FormError message={error} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={close} disabled={pending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save target"}</button>
          </div>
        </form>
      </Modal>
      <Toast message={toast} />
    </>
  );
}
