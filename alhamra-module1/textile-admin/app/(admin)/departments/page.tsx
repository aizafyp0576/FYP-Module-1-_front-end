import { createClient } from "@/lib/supabase/server";
import type { AppUser, Department, ProductionStage } from "@/lib/types";
import DepartmentsClient from "./DepartmentsClient";

export default async function DepartmentsPage() {
  const supabase = createClient();
  const [{ data: depts }, { data: users }, { data: stages }] = await Promise.all([
    supabase.from("departments").select("*").order("department_name"),
    supabase.from("users").select("department_id, is_active"),
    supabase.from("production_stages").select("stage_name, department_id"),
  ]);

  const d = (depts ?? []) as Department[];
  const u = (users ?? []) as Pick<AppUser, "department_id" | "is_active">[];
  const s = (stages ?? []) as Pick<ProductionStage, "stage_name" | "department_id">[];

  const rows = d.map((dep) => ({
    ...dep,
    staff: u.filter((x) => x.department_id === dep.department_id && x.is_active).length,
    stages: s.filter((x) => x.department_id === dep.department_id).map((x) => x.stage_name),
  }));

  return <DepartmentsClient rows={rows} />;
}
