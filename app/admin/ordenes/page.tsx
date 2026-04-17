import { OrdersManager } from "@/components/admin/orders-manager";
import { getOrdenes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrdenes();
  return <OrdersManager initialOrders={orders} />;
}
