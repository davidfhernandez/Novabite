"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { useAdminAuthStore } from "@/store/use-admin-auth-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No fue posible iniciar sesión");
      }

      const admin = await response.json();
      login(admin);
      toast.success("Bienvenido al panel admin");
      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-shell flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="panel-strong w-full max-w-lg rounded-[34px] p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
          Acceso administrativo
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Ingresa a NovaBite Admin</h1>
        <p className="mt-3 text-[var(--muted)]">
          Acceso persistente con validación real de credenciales desde MongoDB.
        </p>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="email"
              className="input-shell pl-11"
              placeholder="Correo administrativo"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="password"
              className="input-shell pl-11"
              placeholder="Contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="button-primary w-full justify-center" disabled={loading}>
            {loading ? "Validando..." : "Entrar al dashboard"}
          </button>
        </div>
      </form>
    </section>
  );
}
