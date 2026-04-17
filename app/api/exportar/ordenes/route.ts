import { NextResponse } from "next/server";
import Papa from "papaparse";

import { getOrdenes } from "@/lib/data";

export async function GET() {
  try {
    const orders = await getOrdenes();
    const csv = Papa.unparse(
      orders.map((order) => ({
        id: order._id,
        numeroOrden: order.numeroOrden,
        numeroFactura: order.numeroFactura,
        cliente: order.cliente.nombre,
        documento: `${order.cliente.tipoDocumento} ${order.cliente.numeroDocumento}`,
        telefono: order.cliente.telefono,
        ciudad: order.cliente.ciudad,
        estado: order.estado,
        subtotal: order.subtotal,
        iva: order.iva,
        total: order.total,
        fecha: order.createdAt,
      })),
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ordenes-novabite.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al exportar órdenes" },
      { status: 500 },
    );
  }
}
