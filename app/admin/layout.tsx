"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { useHydrated } from "@/lib/use-hydrated";
import { useAdminAuthStore } from "@/store/use-admin-auth-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const mounted = useHydrated();

  useEffect(() => {
    if (mounted && pathname !== "/admin/login" && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, mounted, pathname, router]);

  if (!mounted) {
    return (
      <section className="section-shell py-10">
        <div className="panel rounded-[30px] p-6">Cargando panel...</div>
      </section>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <AdminNav />
        </aside>
        <div>{children}</div>
      </div>
    </section>
  );
}
