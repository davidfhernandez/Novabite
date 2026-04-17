import Link from "next/link";

import { NEGOCIO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="section-shell grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
            NovaBite
          </p>
          <h3 className="mt-2 text-2xl font-semibold">Delivery gourmet con foco real en operación.</h3>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Tienda, checkout, panel admin, facturación colombiana simulada y órdenes persistidas en MongoDB.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Navegación</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link href="/">Inicio</Link>
            <Link href="/menu">Menú</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Contacto</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <span>{NEGOCIO.direccion}</span>
            <span>{NEGOCIO.telefono}</span>
            <span>{NEGOCIO.correo}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
