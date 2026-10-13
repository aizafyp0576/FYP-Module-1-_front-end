import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/(admin)/actions";

export const dynamic = "force-dynamic";

export default async function NoAccess() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.isAdmin) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Hi {me.name.split(" ")[0]} 👋</h1>
        <p className="mt-2 text-sm text-slate-600">
          {!me.is_active
            ? "Your account is deactivated or not set up yet. Please contact the System Admin."
            : `You're signed in as ${me.role_name}. Screens for your role arrive in the next module — for now only the System Admin area is live.`}
        </p>
        <form action={signOut} className="mt-6">
          <button className="btn-secondary">Log out</button>
        </form>
      </div>
    </main>
  );
}
