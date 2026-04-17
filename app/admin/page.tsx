import { DashboardClient } from "@/components/admin/dashboard-client";
import { getAdminMetrics, getOrdenes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [metrics, orders] = await Promise.all([getAdminMetrics(), getOrdenes()]);

  return <DashboardClient metrics={metrics} recentOrders={orders} />;
}
