"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { useAdminAuthStore } from "@/store/use-admin-auth-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminAuthStore((state) => state.login);
  const [email, setEmail] = useState("admin@novabite.com");
  const [password, setPassword] = useState("Nova123*");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = login(email, password);

    if (!ok) {
      toast.error("Credenciales incorrectas");
      return;
    }

    toast.success("Bienvenido al panel admin");
    router.push("/admin");
  }

  return (
    <section className="section-shell flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="panel-strong w-full max-w-lg rounded-[34px] p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
          Acceso administrativo
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Ingresa a NovaBite Admin</h1>
        <p className="mt-3 text-[var(--muted)]">
          Autenticación mock persistente en localStorage para revisión operativa del panel.
        </p>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="email"
              className="input-shell pl-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="password"
              className="input-shell pl-11"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="button-primary w-full justify-center">
            Entrar al dashboard
          </button>
        </div>
      </form>
    </section>
  );
}
