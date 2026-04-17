"use client";

import Link from "next/link";
import { BarChart3, LogOut, Package, Receipt, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/use-admin-auth-store";

const links = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/ordenes", label: "Órdenes", icon: Receipt },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminAuthStore((state) => state.logout);

  return (
    <div className="panel-strong rounded-[28px] p-4">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">NovaBite Admin</p>
          <p className="text-xs text-[var(--muted)]">Acceso mock persistente</p>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active ? "bg-violet-500/18 text-white" : "bg-white/5 text-[var(--muted)] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="button-secondary mt-5 w-full justify-center"
        onClick={() => {
          logout();
          router.push("/admin/login");
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}
