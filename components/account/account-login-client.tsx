"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useHydrated } from "@/lib/use-hydrated";
import { useCustomerAuthStore } from "@/store/use-customer-auth-store";

export function AccountLoginClient() {
  const router = useRouter();
  const hydrated = useHydrated();
  const login = useCustomerAuthStore((state) => state.login);
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const customer = useCustomerAuthStore((state) => state.customer);
  const [correo, setCorreo] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated && customer?._id) {
      router.replace("/cuenta");
    }
  }, [customer?._id, hydrated, isAuthenticated, router]);

  if (hydrated && isAuthenticated && customer?._id) {
    return (
      <section className="section-shell flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="panel-strong w-full max-w-lg rounded-[34px] p-8 text-center">
          Redirigiendo a tu cuenta...
        </div>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("/api/cuenta/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, numeroDocumento }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No fue posible ingresar");
      }

      const customer = await response.json();
      login(customer);
      toast.success("Sesión iniciada");
      router.push("/cuenta");
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
          Mi cuenta
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Accede a tu perfil NovaBite</h1>
        <p className="mt-3 text-[var(--muted)]">
          Usa el mismo correo y número de documento con el que hiciste tu pedido.
        </p>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="email"
              className="input-shell pl-11"
              placeholder="Correo"
              autoComplete="email"
              required
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
            />
          </div>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="input-shell pl-11"
              placeholder="Número de documento"
              autoComplete="off"
              required
              value={numeroDocumento}
              onChange={(event) => setNumeroDocumento(event.target.value)}
            />
          </div>
          <button type="submit" className="button-primary w-full justify-center" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </div>
      </form>
    </section>
  );
}
