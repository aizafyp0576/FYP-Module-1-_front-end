import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLE } from "@/lib/types";

export type CurrentUser = {
  user_id: string;
  name: string;
  email: string;
  is_active: boolean;
  role_name: string | null;
  isAdmin: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("user_id, name, email, is_active, roles(role_name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return { user_id: user.id, name: user.email ?? "User", email: user.email ?? "", is_active: false, role_name: null, isAdmin: false };
  }
  const role_name = (data.roles as unknown as { role_name: string } | null)?.role_name ?? null;
  return {
    user_id: data.user_id,
    name: data.name,
    email: data.email,
    is_active: data.is_active,
    role_name,
    isAdmin: data.is_active && role_name === ADMIN_ROLE,
  };
}
