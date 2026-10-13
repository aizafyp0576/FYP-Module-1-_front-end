"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BAN_FOREVER = "876000h"; // ~100 years

async function guard() {
  const me = await getCurrentUser();
  if (!me || !me.isAdmin) throw new Error("Only an active System Admin can do this.");
  return me;
}

function fail(e: unknown): ActionResult {
  const msg = e instanceof Error ? e.message : String(e);
  if (/duplicate key/i.test(msg)) return { ok: false, error: "That value already exists. Please use a different one." };
  return { ok: false, error: msg };
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const optInt = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v === "" ? null : Number(v);
};

/* ----------------------------- AUTH ----------------------------- */

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/* ----------------------------- USERS ----------------------------- */

export async function createUser(fd: FormData): Promise<ActionResult> {
  try {
    await guard();
    const name = str(fd, "name");
    const email = str(fd, "email").toLowerCase();
    const password = str(fd, "password");
    const role_id = optInt(fd, "role_id");
    const department_id = optInt(fd, "department_id");

    if (name.length < 2) return { ok: false, error: "Enter the user's full name." };
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
    if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
    if (!role_id) return { ok: false, error: "Select a role." };

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error || !data.user) return { ok: false, error: error?.message ?? "Could not create login." };

    const { error: pErr } = await admin.from("users").insert({
      user_id: data.user.id,
      name,
      email,
      role_id,
      department_id,
      is_active: true,
    });
    if (pErr) {
      await admin.auth.admin.deleteUser(data.user.id); // roll back the login
      throw pErr;
    }
    revalidatePath("/users");
    revalidatePath("/dashboard");
    return { ok: true, message: `${name} was added.` };
  } catch (e) {
    return fail(e);
  }
}

export async function editUser(fd: FormData): Promise<ActionResult> {
  try {
    await guard();
    const user_id = str(fd, "user_id");
    const name = str(fd, "name");
    const email = str(fd, "email").toLowerCase();
    const password = str(fd, "password");

    if (name.length < 2) return { ok: false, error: "Enter the user's full name." };
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
    if (password && password.length < 8) return { ok: false, error: "New password must be at least 8 characters." };

    const admin = createAdminClient();
    const authUpdate: { email: string; email_confirm: boolean; password?: string; user_metadata: object } = {
      email,
      email_confirm: true,
      user_metadata: { name },
    };
    if (password) authUpdate.password = password;
    const { error: aErr } = await admin.auth.admin.updateUserById(user_id, authUpdate);
    if (aErr) return { ok: false, error: aErr.message };

    const supabase = createClient();
    const { error } = await supabase.from("users").update({ name, email }).eq("user_id", user_id);
    if (error) throw error;

    revalidatePath("/users");
    return { ok: true, message: "User details saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function assignRoleAndDepartment(fd: FormData): Promise<ActionResult> {
  try {
    const me = await guard();
    const user_id = str(fd, "user_id");
    const role_id = optInt(fd, "role_id");
    const department_id = optInt(fd, "department_id");
    if (!role_id) return { ok: false, error: "Select a role." };

    const supabase = createClient();
    if (user_id === me.user_id) {
      const { data: r } = await supabase.from("roles").select("role_name").eq("role_id", role_id).single();
      if (r?.role_name !== "System Admin")
        return { ok: false, error: "You can't remove your own System Admin role." };
    }
    const { error } = await supabase.from("users").update({ role_id, department_id }).eq("user_id", user_id);
    if (error) throw error;

    revalidatePath("/users");
    revalidatePath("/dashboard");
    return { ok: true, message: "Role and department updated." };
  } catch (e) {
    return fail(e);
  }
}

export async function setUserActive(user_id: string, active: boolean): Promise<ActionResult> {
  try {
    const me = await guard();
    if (user_id === me.user_id && !active) return { ok: false, error: "You can't deactivate your own account." };

    const admin = createAdminClient();
    const { error: aErr } = await admin.auth.admin.updateUserById(user_id, {
      ban_duration: active ? "none" : BAN_FOREVER,
    });
    if (aErr) return { ok: false, error: aErr.message };

    const supabase = createClient();
    const { error } = await supabase.from("users").update({ is_active: active }).eq("user_id", user_id);
    if (error) throw error;

    revalidatePath("/users");
    revalidatePath("/dashboard");
    return { ok: true, message: active ? "User reactivated." : "User deactivated — they can no longer log in." };
  } catch (e) {
    return fail(e);
  }
}

/* -------------------------- DEPARTMENTS -------------------------- */

export async function saveDepartment(fd: FormData): Promise<ActionResult> {
  try {
    await guard();
    const id = optInt(fd, "department_id");
    const department_name = str(fd, "department_name");
    const description = str(fd, "description") || null;
    if (department_name.length < 2) return { ok: false, error: "Enter a department name." };

    const supabase = createClient();
    const { error } = id
      ? await supabase.from("departments").update({ department_name, description }).eq("department_id", id)
      : await supabase.from("departments").insert({ department_name, description });
    if (error) throw error;

    revalidatePath("/departments");
    revalidatePath("/dashboard");
    return { ok: true, message: id ? "Department updated." : `${department_name} was added.` };
  } catch (e) {
    return fail(e);
  }
}

/* ----------------------- PROCESSING TARGETS ----------------------- */

export async function saveStage(fd: FormData): Promise<ActionResult> {
  try {
    await guard();
    const id = optInt(fd, "stage_id");
    const stage_name = str(fd, "stage_name");
    const stage_sequence = Number(str(fd, "stage_sequence"));
    const department_id = optInt(fd, "department_id");
    const target_duration_hrs = Number(str(fd, "target_duration_hrs"));

    if (stage_name.length < 2) return { ok: false, error: "Enter a stage name." };
    if (!Number.isInteger(stage_sequence) || stage_sequence < 1)
      return { ok: false, error: "Sequence must be a whole number (1, 2, 3…)." };
    if (!(target_duration_hrs > 0) || target_duration_hrs > 9999)
      return { ok: false, error: "Target time must be more than 0 hours." };

    const row = { stage_name, stage_sequence, department_id, target_duration_hrs };
    const supabase = createClient();
    const { error } = id
      ? await supabase.from("production_stages").update(row).eq("stage_id", id)
      : await supabase.from("production_stages").insert(row);
    if (error) throw error;

    revalidatePath("/targets");
    revalidatePath("/dashboard");
    return { ok: true, message: "Processing target saved." };
  } catch (e) {
    return fail(e);
  }
}
