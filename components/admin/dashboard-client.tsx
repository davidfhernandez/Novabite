"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumnIncreasing, DollarSign, Package, Receipt } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { MetricasAdmin, Orden } from "@/types";

const metricCards = [
  { key: "totalOrdenes", title: "Órdenes", icon: Receipt },
  { key: "ingresos", title: "Ingresos", icon: DollarSign },
  { key: "totalProductos", title: "Productos", icon: Package },
  { key: "ordenesDelDia", title: "Órdenes hoy", icon: ChartColumnIncreasing },
] as const;

export function DashboardClient({
  metrics,
  recentOrders,
}: {
  metrics: MetricasAdmin;
  recentOrders: Orden[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "ingresos"
              ? formatCurrency(metrics.ingresos)
              : metrics[card.key];

          return (
            <article key={card.key} className="panel rounded-[28px] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--muted)]">{card.title}</p>
                <Icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <p className="mt-6 text-3xl font-semibold">{value}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel-strong rounded-[30px] p-6">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Ventas
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Ingresos últimos 7 días</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.ventasPorDia}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fill: "#a4a7ba", fontSize: 12 }} />
                <YAxis tick={{ fill: "#a4a7ba", fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#22d3ee", strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-strong rounded-[30px] p-6">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Órdenes
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Distribución por estado</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.ordenesPorEstado}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="estado" tick={{ fill: "#a4a7ba", fontSize: 12 }} />
                <YAxis tick={{ fill: "#a4a7ba", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#22d3ee" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel-strong rounded-[30px] p-6">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Actividad reciente
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Últimas órdenes creadas</h2>
        </div>
        <div className="space-y-3">
          {recentOrders.slice(0, 5).map((order) => (
            <div
              key={order._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <div>
                <p className="font-semibold">{order.numeroOrden}</p>
                <p className="text-sm text-[var(--muted)]">
                  {order.cliente.nombre} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-white/8 px-3 py-1 text-sm">
                  {order.estado}
                </span>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
