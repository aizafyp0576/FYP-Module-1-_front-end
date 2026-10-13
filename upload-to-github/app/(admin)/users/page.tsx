import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { AppUser, Department, Role } from "@/lib/types";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const supabase = createClient();
  const me = await getCurrentUser();
  const [{ data: users }, { data: roles }, { data: depts }] = await Promise.all([
    supabase.from("users").select("user_id, name, email, role_id, department_id, is_active, created_at").order("name"),
    supabase.from("roles").select("*").order("role_id"),
    supabase.from("departments").select("*").order("department_name"),
  ]);
  return (
    <UsersClient
      meId={me?.user_id ?? ""}
      users={(users ?? []) as AppUser[]}
      roles={(roles ?? []) as Role[]}
      departments={(depts ?? []) as Department[]}
    />
  );
}
