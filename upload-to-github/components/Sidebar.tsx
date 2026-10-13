"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/(admin)/actions";
import { IconBuilding, IconClock, IconDashboard, IconLogout, IconMenu, IconShield, IconUsers, IconX } from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/users", label: "Users", Icon: IconUsers },
  { href: "/departments", label: "Departments", Icon: IconBuilding },
  { href: "/targets", label: "Processing Targets", Icon: IconClock },
  { href: "/roles", label: "Roles & Permissions", Icon: IconShield },
];

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="h-full w-full object-contain" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">Al-Hamra Textile</div>
        <div className="text-[11px] text-brand-200">Management Platform</div>
      </div>
    </div>
  );
}

export default function Sidebar({ name, email }: { name: string; email: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      <div className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-brand-300/80">System Admin</div>
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-white/10 text-white" : "text-brand-100/80 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{name}</div>
          <div className="truncate text-xs text-brand-200/80">{email}</div>
        </div>
      </div>
      <form action={signOut}>
        <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-100/80 hover:bg-white/5 hover:text-white">
          <IconLogout className="h-[18px] w-[18px]" />
          Log out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-900 px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white hover:bg-white/10" aria-label="Open menu">
          <IconMenu />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-brand-900">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white hover:bg-white/10" aria-label="Close menu">
                <IconX className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-brand-900 lg:flex">
        <div className="px-6 py-5">
          <Logo />
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
