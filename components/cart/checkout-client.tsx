"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CreditCard, MapPinHouse, UserRound } from "lucide-react";
import { toast } from "sonner";

import { METODOS_PAGO } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { ClienteFacturacion } from "@/types";

const STEPS = [
  { id: 1, title: "Cliente", icon: UserRound },
  { id: 2, title: "Entrega", icon: MapPinHouse },
  { id: 3, title: "Pago", icon: CreditCard },
];

const EMPTY_FORM: ClienteFacturacion = {
  nombre: "",
  correo: "",
  telefono: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  direccion: "",
  ciudad: "Bogotá D.C.",
  referencia: "",
};

export function CheckoutClient() {
  const router = useRouter();
  const { items, coupon, getSummary, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState(METODOS_PAGO[0]);
  const [observaciones, setObservaciones] = useState("");
  const [form, setForm] = useState<ClienteFacturacion>(EMPTY_FORM);

  const summary = getSummary();
  const cartIsEmpty = items.length === 0;
  const canGoNext = useMemo(() => {
    if (step === 1) {
      return Boolean(
        form.nombre &&
          form.correo &&
          form.telefono &&
          form.tipoDocumento &&
          form.numeroDocumento,
      );
    }

    if (step === 2) {
      return Boolean(form.direccion && form.ciudad);
    }

    return Boolean(metodoPago);
  }, [form, metodoPago, step]);

  async function submitOrder() {
    if (cartIsEmpty) {
      toast.error("Tu carrito está vacío");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: form,
          items: items.map((item) => ({
            productoId: item.productoId,
            nombre: item.nombre,
            slug: item.slug,
            imagen: item.imagen,
            categoria: item.categoria,
            precioBase: item.precioBase,
            cantidad: item.cantidad,
            personalizacionesSeleccionadas: item.personalizacionesSeleccionadas,
          })),
          cupon: coupon,
          metodoPago,
          observaciones,
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible crear la orden");
      }

      const order = await response.json();
      clearCart();
      toast.success("Orden creada correctamente");
      router.push(`/confirmacion/${order._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (cartIsEmpty) {
    return (
      <section className="section-shell py-16">
        <div className="panel mx-auto max-w-2xl rounded-[32px] p-8 text-center">
          <h1 className="text-3xl font-semibold">Tu carrito está vacío</h1>
          <p className="mt-3 text-[var(--muted)]">
            Agrega productos al carrito para continuar con el checkout.
          </p>
          <a href="/menu" className="button-primary mt-6 inline-flex">
            Ir al menú
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="panel rounded-[30px] p-5">
            <div className="flex flex-wrap gap-3">
              {STEPS.map((item) => {
                const Icon = item.icon;
                const active = item.id === step;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm ${
                      active ? "bg-violet-500/18 text-white" : "bg-white/5 text-[var(--muted)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-strong rounded-[32px] p-6">
            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-[var(--muted)]">Nombre completo</label>
                  <input
                    className="input-shell"
                    value={form.nombre}
                    onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Correo</label>
                  <input
                    type="email"
                    className="input-shell"
                    value={form.correo}
                    onChange={(event) => setForm({ ...form, correo: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Teléfono</label>
                  <input
                    className="input-shell"
                    value={form.telefono}
                    onChange={(event) => setForm({ ...form, telefono: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Tipo de documento</label>
                  <select
                    className="input-shell"
                    value={form.tipoDocumento}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        tipoDocumento: event.target.value as ClienteFacturacion["tipoDocumento"],
                      })
                    }
                  >
                    <option value="CC">CC</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Número de documento</label>
                  <input
                    className="input-shell"
                    value={form.numeroDocumento}
                    onChange={(event) =>
                      setForm({ ...form, numeroDocumento: event.target.value })
                    }
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Dirección</label>
                  <input
                    className="input-shell"
                    value={form.direccion}
                    onChange={(event) => setForm({ ...form, direccion: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Ciudad</label>
                  <input
                    className="input-shell"
                    value={form.ciudad}
                    onChange={(event) => setForm({ ...form, ciudad: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Referencia</label>
                  <textarea
                    className="input-shell min-h-28"
                    value={form.referencia}
                    onChange={(event) => setForm({ ...form, referencia: event.target.value })}
                    placeholder="Apartamento, portería, indicaciones para el domiciliario..."
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {METODOS_PAGO.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setMetodoPago(method)}
                      className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                        metodoPago === method
                          ? "border-violet-400 bg-violet-500/15"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[var(--muted)]">Observaciones</label>
                  <textarea
                    className="input-shell min-h-28"
                    value={observaciones}
                    onChange={(event) => setObservaciones(event.target.value)}
                    placeholder="Sin cebolla, llamar al llegar, timbre 301..."
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setStep((current) => current - 1)}
                >
                  Volver
                </button>
              ) : null}

              {step < 3 ? (
                <button
                  type="button"
                  className="button-primary"
                  disabled={!canGoNext}
                  onClick={() => setStep((current) => current + 1)}
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  className="button-primary"
                  disabled={loading || !canGoNext}
                  onClick={submitOrder}
                >
                  {loading ? "Creando orden..." : "Confirmar compra"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="panel-strong h-fit rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Resumen del pedido
          </p>
          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {item.cantidad} unidad(es)
                    {item.personalizacionesSeleccionadas.length > 0
                      ? ` · ${item.personalizacionesSeleccionadas
                          .map((option) => option.opcionNombre)
                          .join(", ")}`
                      : ""}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatCurrency(
                    (item.precioBase +
                      item.personalizacionesSeleccionadas.reduce(
                        (acc, option) => acc + option.precio,
                        0,
                      )) * item.cantidad,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span>{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Descuento</span>
              <span>{formatCurrency(summary.descuento)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">IVA 19%</span>
              <span>{formatCurrency(summary.iva)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
