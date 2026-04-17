import { notFound } from "next/navigation";

import { OrderConfirmationClient } from "@/components/cart/order-confirmation-client";
import { getOrdenPorId } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrdenPorId(id);

  if (!order) {
    notFound();
  }

  return <OrderConfirmationClient order={order} />;
}
