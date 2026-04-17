"use client";

import Link from "next/link";
import { Gift, LogOut, ReceiptText, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { formatCurrency, formatDate } from "@/lib/utils";
import { useCustomerAuthStore } from "@/store/use-customer-auth-store";
import { ClientePerfil } from "@/types";

export function AccountProfileClient() {
  const { customer, updateCustomer, logout } = useCustomerAuthStore();
  const [profile, setProfile] = useState<ClientePerfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!customer?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/cuenta/${customer._id}`);
        if (!response.ok) {
          throw new Error("No fue posible cargar tu perfil");
        }

        const data: ClientePerfil = await response.json();
        setProfile(data);
        updateCustomer(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [customer?._id, updateCustomer]);

  if (!customer) {
    return (
      <section className="section-shell py-14">
        <div className="panel mx-auto max-w-2xl rounded-[32px] p-8 text-center">
          <h1 className="text-3xl font-semibold">Inicia sesión para ver tu cuenta</h1>
          <p className="mt-3 text-[var(--muted)]">
            Tu cuenta se crea automáticamente cuando haces tu primer pedido.
          </p>
          <Link href="/cuenta/login" className="button-primary mt-6 inline-flex">
            Ir a mi cuenta
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section-shell py-14">
        <div className="panel rounded-[32px] p-8">Cargando perfil...</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="section-shell py-14">
        <div className="panel rounded-[32px] p-8">No pudimos cargar tu perfil.</div>
      </section>
    );
  }

  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6">
          <div className="panel-strong rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <UserRound className="h-6 w-6" />
              </div>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  logout();
                  toast.success("Sesión cerrada");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </button>
            </div>
            <h1 className="mt-5 text-3xl font-semibold">{profile.nombre}</h1>
            <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
              <p>{profile.correo}</p>
              <p>{profile.telefono}</p>
              <p>
                {profile.tipoDocumento} {profile.numeroDocumento}
              </p>
              <p>
                {profile.direccion}, {profile.ciudad}
              </p>
            </div>
          </div>

          <div className="panel-strong rounded-[32px] p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-2xl font-semibold">Nova Puntos</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-[var(--muted)]">Disponibles</p>
                <p className="mt-2 text-3xl font-semibold">{profile.puntosDisponibles}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-[var(--muted)]">Históricos</p>
                <p className="mt-2 text-3xl font-semibold">{profile.puntosHistoricos}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Acumulas puntos con cada pedido y puedes canjearlos en el checkout por comida gratis.
            </p>
            <Link href="/checkout" className="button-primary mt-5 inline-flex">
              Ir a canjear
            </Link>
          </div>

          <div className="panel-strong rounded-[32px] p-6">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-2xl font-semibold">Recompensas</h2>
            </div>
            <div className="mt-5 space-y-3">
              {profile.recompensasDisponibles.map((reward) => {
                const unlocked = profile.puntosDisponibles >= reward.puntosNecesarios;
                return (
                  <div
                    key={reward.id}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{reward.nombre}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{reward.descripcion}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                        {reward.puntosNecesarios} pts
                      </span>
                    </div>
                    <p className="mt-3 text-sm">
                      {unlocked ? "Disponible para canje" : "Sigue acumulando para desbloquearla"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="panel-strong rounded-[32px] p-6">
          <div className="flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Historial
              </p>
              <h2 className="mt-1 text-3xl font-semibold">Tus pedidos</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {profile.pedidos.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-[var(--muted)]">
                Aún no tienes pedidos registrados.
              </div>
            ) : (
              profile.pedidos.map((order) => (
                <article
                  key={order._id}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{order.numeroOrden}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {formatDate(order.createdAt)} · {order.estado}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-[var(--muted)]">
                        +{order.puntosGanados ?? 0} pts
                        {(order.puntosCanjeados ?? 0) > 0
                          ? ` · -${order.puntosCanjeados} pts`
                          : ""}
                      </p>
                    </div>
                  </div>
                  {order.recompensaCanjeada ? (
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      Recompensa canjeada: {order.recompensaCanjeada}
                    </p>
                  ) : null}
                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={`${order._id}-${item.productoId}-${item.nombre}`}
                        className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-[var(--muted)]">{item.cantidad} unidad(es)</p>
                        </div>
                        <span>{formatCurrency(item.precioBase * item.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
