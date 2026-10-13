export type Role = { role_id: number; role_name: string; description: string | null };

export type Department = {
  department_id: number;
  department_name: string;
  description: string | null;
  created_at: string;
};

export type ProductionStage = {
  stage_id: number;
  stage_name: string;
  stage_sequence: number;
  department_id: number | null;
  target_duration_hrs: number;
  updated_at: string;
};

export type AppUser = {
  user_id: string;
  name: string;
  email: string;
  role_id: number;
  department_id: number | null;
  is_active: boolean;
  created_at: string;
};

export type Permission = { permission_id: number; code: string; label: string; sort_order: number };
export type RolePermission = { role_id: number; permission_id: number; access: "YES" | "LIMITED" };

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export const ADMIN_ROLE = "System Admin";
