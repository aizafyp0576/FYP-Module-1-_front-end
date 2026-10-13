import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/Feedback";
import { IconArrowRight, IconBuilding, IconClock, IconShield, IconUsers } from "@/components/icons";
import type { AppUser, Department, ProductionStage, Role } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const me = await getCurrentUser();

  const [{ data: users }, { data: roles }, { data: depts }, { data: stages }] = await Promise.all([
    supabase.from("users").select("user_id, name, email, role_id, department_id, is_active, created_at").order("created_at", { ascending: false }),
    supabase.from("roles").select("*").order("role_id"),
    supabase.from("departments").select("*").order("department_name"),
    supabase.from("production_stages").select("*").order("stage_sequence"),
  ]);

  const u = (users ?? []) as AppUser[];
  const r = (roles ?? []) as Role[];
  const d = (depts ?? []) as Department[];
  const s = (stages ?? []) as ProductionStage[];

  const active = u.filter((x) => x.is_active).length;
  const totalTarget = s.reduce((sum, x) => sum + Number(x.target_duration_hrs), 0);
  const roleName = (id: number) => r.find((x) => x.role_id === id)?.role_name ?? "—";
  const deptName = (id: number | null) => d.find((x) => x.department_id === id)?.department_name ?? "Unassigned";

  const byRole = r.map((role) => ({ label: role.role_name, count: u.filter((x) => x.role_id === role.role_id).length }));
  const maxRole = Math.max(1, ...byRole.map((x) => x.count));
  const byDept = d.map((dep) => ({ label: dep.department_name, count: u.filter((x) => x.department_id === dep.department_id).length }));
  const unassigned = u.filter((x) => x.department_id === null && roleName(x.role_id) !== "System Admin").length;

  const stats = [
    { label: "Active users", value: active, sub: `${u.length - active} deactivated`, Icon: IconUsers, href: "/users" },
    { label: "Departments", value: d.length, sub: unassigned ? `${unassigned} user(s) without a department` : "All staff assigned", Icon: IconBuilding, href: "/departments" },
    { label: "Production stages", value: s.length, sub: `${totalTarget} hrs total target`, Icon: IconClock, href: "/targets" },
    { label: "Roles", value: r.length, sub: "RBAC matrix from SRS", Icon: IconShield, href: "/roles" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${me?.name.split(" ")[0] ?? "Admin"}`} description="Overview of users, departments and processing targets." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, Icon, href }) => (
          <Link key={label} href={href} className="card group p-5 transition hover:border-brand-300 hover:shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span className="rounded-lg bg-brand-50 p-2 text-brand-600"><Icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{sub}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Users by role</h2>
          <ul className="mt-4 space-y-3">
            {byRole.map((x) => (
              <li key={x.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{x.label}</span>
                  <span className="font-medium tabular-nums text-slate-900">{x.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(x.count / maxRole) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Production flow &amp; targets</h2>
            <Link href="/targets" className="text-xs font-medium text-brand-600 hover:underline">Configure</Link>
          </div>
          {s.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No stages yet.</p>
          ) : (
            <ol className="mt-4 flex flex-wrap items-center gap-2">
              {s.map((st, i) => (
                <li key={st.stage_id} className="flex items-center gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-xs text-slate-500">Step {st.stage_sequence}</div>
                    <div className="text-sm font-medium text-slate-900">{st.stage_name}</div>
                    <div className="text-xs tabular-nums text-brand-700">{Number(st.target_duration_hrs)} hrs</div>
                  </div>
                  {i < s.length - 1 && <IconArrowRight className="h-4 w-4 text-slate-300" />}
                </li>
              ))}
            </ol>
          )}
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Staff per department</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {byDept.map((x) => (
              <span key={x.label} className="badge bg-slate-100 py-1 text-slate-700">
                {x.label} <span className="ml-1.5 font-semibold tabular-nums">{x.count}</span>
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recently added users</h2>
          <Link href="/users" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr><th className="th">Name</th><th className="th">Role</th><th className="th">Department</th><th className="th">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {u.slice(0, 5).map((x) => (
                <tr key={x.user_id}>
                  <td className="td"><div className="font-medium text-slate-900">{x.name}</div><div className="text-xs text-slate-500">{x.email}</div></td>
                  <td className="td">{roleName(x.role_id)}</td>
                  <td className="td">{deptName(x.department_id)}</td>
                  <td className="td"><StatusBadge active={x.is_active} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

