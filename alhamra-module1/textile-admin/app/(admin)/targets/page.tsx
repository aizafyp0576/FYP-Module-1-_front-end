import { createClient } from "@/lib/supabase/server";
import type { Department, ProductionStage } from "@/lib/types";
import TargetsClient from "./TargetsClient";

export default async function TargetsPage() {
  const supabase = createClient();
  const [{ data: stages }, { data: depts }] = await Promise.all([
    supabase.from("production_stages").select("*").order("stage_sequence"),
    supabase.from("departments").select("*").order("department_name"),
  ]);
  return <TargetsClient stages={(stages ?? []) as ProductionStage[]} departments={(depts ?? []) as Department[]} />;
}
