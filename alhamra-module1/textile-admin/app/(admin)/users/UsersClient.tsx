"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { FormError, PageHeader, StatusBadge, Toast } from "@/components/Feedback";
import { IconPencil, IconPlus, IconSearch, IconShield } from "@/components/icons";
import { useAction } from "@/components/useAction";
import type { AppUser, Department, Role } from "@/lib/types";
import { assignRoleAndDepartment, createUser, editUser, setUserActive } from "../actions";

type Mode = { kind: "create" } | { kind: "edit"; user: AppUser } | { kind: "assign"; user: AppUser } | { kind: "toggle"; user: AppUser } | null;

export default function UsersClient({
  meId,
  users,
  roles,
  departments,
}: {
  meId: string;
  users: AppUser[];
  roles: Role[];
  departments: Department[];
}) {
  const [mode, setMode] = useState<Mode>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState("");
  const { pending, error, setError, toast, run } = useAction();

  const roleName = (id: number) => roles.find((r) => r.role_id === id)?.role_name ?? "—";
  const deptName = (id: number | null) => departments.find((d) => d.department_id === id)?.department_name ?? "—";

  const rows = useMemo(() => {
    const term = q.toLowerCase();
    return users.filter(
      (u) =>
        (!term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) &&
        (status === "all" || (status === "active" ? u.is_active : !u.is_active)) &&
        (!roleFilter || String(u.role_id) === roleFilter)
    );
  }, [users, q, status, roleFilter]);

  const close = () => {
    setMode(null);
    setError(null);
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Create accounts for supervisors, department heads and managers, and control who can log in."
        action={
          <button className="btn-primary" onClick={() => setMode({ kind: "create" })}>
            <IconPlus className="h-4 w-4" /> Create user
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
          </div>
          <select className="input sm:w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
            <option value="">All roles</option>
            {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
          </select>
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 text-sm" role="group" aria-label="Filter by status">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`rounded-md px-3 py-1.5 capitalize ${status === s ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">User</th>
                <th className="th">Role</th>
                <th className="th">Department</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr><td colSpan={5} className="td py-10 text-center text-slate-500">No users match these filters.</td></tr>
              )}
              {rows.map((u) => (
                <tr key={u.user_id} className={u.is_active ? "" : "bg-slate-50/60"}>
                  <td className="td">
                    <div className="font-medium text-slate-900">
                      {u.name} {u.user_id === meId && <span className="badge ml-1 bg-brand-50 text-brand-700">You</span>}
                    </div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="td whitespace-nowrap">{roleName(u.role_id)}</td>
                  <td className="td whitespace-nowrap">{deptName(u.department_id)}</td>
                  <td className="td"><StatusBadge active={u.is_active} /></td>
                  <td className="td">
                    <div className="flex justify-end gap-1 whitespace-nowrap">
                      <button className="btn-ghost" onClick={() => setMode({ kind: "edit", user: u })} title="Edit user">
                        <IconPencil className="h-4 w-4" /><span className="hidden xl:inline">Edit</span>
                      </button>
                      <button className="btn-ghost" onClick={() => setMode({ kind: "assign", user: u })} title="Assign role & department">
                        <IconShield className="h-4 w-4" /><span className="hidden xl:inline">Assign</span>
                      </button>
                      {u.user_id !== meId && (
                        <button
                          className={`btn-ghost ${u.is_active ? "text-red-600 hover:bg-red-50 hover:text-red-700" : "text-emerald-700 hover:bg-emerald-50"}`}
                          onClick={() => setMode({ kind: "toggle", user: u })}
                        >
                          {u.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          Showing {rows.length} of {users.length} users
        </div>
      </div>

      {/* CREATE */}
      <Modal open={mode?.kind === "create"} title="Create user" subtitle="They'll log in with this email and password." onClose={close}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => createUser(fd), close);
          }}
        >
          <Field label="Full name" name="name" required placeholder="e.g. Ahmed Raza" />
          <Field label="Email" name="email" type="email" required placeholder="name@alhamratextile.com" />
          <Field label="Temporary password" name="password" type="text" required minLength={8} placeholder="At least 8 characters" hint="Share this with the user; they can use it to log in." />
          <RoleDeptFields roles={roles} departments={departments} />
          <FormError message={error} />
          <Footer onCancel={close} pending={pending} label="Create user" />
        </form>
      </Modal>

      {/* EDIT */}
      {mode?.kind === "edit" && (
        <Modal open title="Edit user" subtitle={mode.user.email} onClose={close}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() => editUser(fd), close);
            }}
          >
            <input type="hidden" name="user_id" value={mode.user.user_id} />
            <Field label="Full name" name="name" required defaultValue={mode.user.name} />
            <Field label="Email" name="email" type="email" required defaultValue={mode.user.email} />
            <Field label="New password" name="password" type="text" minLength={8} placeholder="Leave blank to keep current password" />
            <FormError message={error} />
            <Footer onCancel={close} pending={pending} label="Save changes" />
          </form>
        </Modal>
      )}

      {/* ASSIGN ROLE & DEPARTMENT */}
      {mode?.kind === "assign" && (
        <Modal open title="Assign role & department" subtitle={mode.user.name} onClose={close}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() => assignRoleAndDepartment(fd), close);
            }}
          >
            <input type="hidden" name="user_id" value={mode.user.user_id} />
            <RoleDeptFields roles={roles} departments={departments} roleId={mode.user.role_id} deptId={mode.user.department_id} />
            <FormError message={error} />
            <Footer onCancel={close} pending={pending} label="Save assignment" />
          </form>
        </Modal>
      )}

      {/* DEACTIVATE / REACTIVATE */}
      {mode?.kind === "toggle" && (
        <Modal open title={mode.user.is_active ? "Deactivate user?" : "Reactivate user?"} onClose={close}>
          <p className="text-sm text-slate-600">
            {mode.user.is_active ? (
              <><strong>{mode.user.name}</strong> will be logged out and won&apos;t be able to log in. Their records stay in the system and you can reactivate them any time.</>
            ) : (
              <><strong>{mode.user.name}</strong> will be able to log in again with their existing password.</>
            )}
          </p>
          <div className="mt-4 space-y-4">
            <FormError message={error} />
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={close} disabled={pending}>Cancel</button>
              <button
                className={mode.user.is_active ? "btn bg-red-600 text-white hover:bg-red-700" : "btn-primary"}
                disabled={pending}
                onClick={() => run(() => setUserActive(mode.user.user_id, !mode.user.is_active), close)}
              >
                {pending ? "Saving…" : mode.user.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast message={toast} />
    </>
  );
}

function Field({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${props.name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} className="input" autoComplete="off" {...props} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function RoleDeptFields({ roles, departments, roleId, deptId }: { roles: Role[]; departments: Department[]; roleId?: number; deptId?: number | null }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="f-role" className="label">Role</label>
        <select id="f-role" name="role_id" required className="input" defaultValue={roleId ?? ""}>
          <option value="" disabled>Select role</option>
          {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-dept" className="label">Department</label>
        <select id="f-dept" name="department_id" className="input" defaultValue={deptId ?? ""}>
          <option value="">None</option>
          {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
        </select>
      </div>
    </div>
  );
}

function Footer({ onCancel, pending, label }: { onCancel: () => void; pending: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" className="btn-secondary" onClick={onCancel} disabled={pending}>Cancel</button>
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving…" : label}</button>
    </div>
  );
}
