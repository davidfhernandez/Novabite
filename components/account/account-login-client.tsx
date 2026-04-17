"use client";

import { FormEvent, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCustomerAuthStore } from "@/store/use-customer-auth-store";

export function AccountLoginClient() {
  const router = useRouter();
  const login = useCustomerAuthStore((state) => state.login);
  const [correo, setCorreo] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [loading, setLoading] = useState(false);

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
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
            />
          </div>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="input-shell pl-11"
              placeholder="Número de documento"
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
