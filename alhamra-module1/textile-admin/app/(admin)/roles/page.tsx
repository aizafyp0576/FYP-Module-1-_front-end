import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/Feedback";
import { IconCheck } from "@/components/icons";
import type { AppUser, Permission, Role, RolePermission } from "@/lib/types";

export default async function RolesPage() {
  const supabase = createClient();
  const [{ data: roles }, { data: perms }, { data: rp }, { data: users }] = await Promise.all([
    supabase.from("roles").select("*").order("role_id"),
    supabase.from("permissions").select("*").order("sort_order"),
    supabase.from("role_permissions").select("*"),
    supabase.from("users").select("role_id, is_active"),
  ]);
  const r = (roles ?? []) as Role[];
  const p = (perms ?? []) as Permission[];
  const m = (rp ?? []) as RolePermission[];
  const u = (users ?? []) as Pick<AppUser, "role_id" | "is_active">[];

  const access = (roleId: number, permId: number) => m.find((x) => x.role_id === roleId && x.permission_id === permId)?.access;

  return (
    <>
      <PageHeader title="Roles & Permissions" description="What each role is allowed to do. This matrix comes from the SRS and is read-only." />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Role</th>
                {p.map((x) => <th key={x.permission_id} className="th text-center">{x.label}</th>)}
                <th className="th text-right">Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {r.map((role) => (
                <tr key={role.role_id}>
                  <td className="td">
                    <div className="font-medium text-slate-900">{role.role_name}</div>
                    <div className="max-w-xs text-xs text-slate-500">{role.description}</div>
                  </td>
                  {p.map((perm) => {
                    const a = access(role.role_id, perm.permission_id);
                    return (
                      <td key={perm.permission_id} className="td text-center">
                        {a === "YES" ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" title="Yes">
                            <IconCheck className="h-4 w-4" /><span className="sr-only">Yes</span>
                          </span>
                        ) : a === "LIMITED" ? (
                          <span className="badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">Limited</span>
                        ) : (
                          <span className="text-slate-300" title="No">—<span className="sr-only">No</span></span>
                        )}
                      </td>
                    );
                  })}
                  <td className="td text-right tabular-nums">{u.filter((x) => x.role_id === role.role_id && x.is_active).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">To change a person&apos;s access, go to Users → Assign.</p>
    </>
  );
}
