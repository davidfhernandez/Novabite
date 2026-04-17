"use client";

import jsPDF from "jspdf";

import { NEGOCIO } from "@/lib/constants";
import { getItemUnitPrice } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { Orden } from "@/types";

export function downloadInvoicePdf(order: Orden) {
  const doc = new jsPDF();
  const violet: [number, number, number] = [139, 92, 246];
  const cyan: [number, number, number] = [34, 211, 238];
  const dark: [number, number, number] = [17, 19, 34];
  const gray: [number, number, number] = [106, 115, 139];

  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("NovaBite", 20, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Factura de venta simulada", 20, 30);

  doc.setFillColor(...violet);
  doc.circle(178, 20, 10, "F");
  doc.setFillColor(...cyan);
  doc.circle(188, 15, 4, "F");

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Factura ${order.numeroFactura}`, 20, 58);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Pedido: ${order.numeroOrden}`, 20, 66);
  doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString("es-CO")}`, 20, 72);
  doc.text(`NIT negocio: ${NEGOCIO.nit}`, 20, 78);
  doc.text(`Dirección: ${NEGOCIO.direccion}`, 20, 84);

  doc.setFont("helvetica", "bold");
  doc.text("Datos del cliente", 20, 98);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${order.cliente.nombre}`, 20, 106);
  doc.text(
    `Documento: ${order.cliente.tipoDocumento} ${order.cliente.numeroDocumento}`,
    20,
    112,
  );
  doc.text(`Teléfono: ${order.cliente.telefono}`, 20, 118);
  doc.text(`Dirección: ${order.cliente.direccion}`, 20, 124);
  doc.text(`Correo: ${order.cliente.correo}`, 20, 130);

  let y = 144;
  doc.setFillColor(245, 244, 255);
  doc.rect(20, y, 170, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Producto", 24, y + 7);
  doc.text("Cant.", 126, y + 7);
  doc.text("Unitario", 146, y + 7);
  doc.text("Total", 178, y + 7);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  order.items.forEach((item) => {
    const lineTotal = getItemUnitPrice(item) * item.cantidad;
    doc.text(item.nombre.slice(0, 34), 24, y);
    if (item.personalizacionesSeleccionadas.length > 0) {
      doc.setTextColor(...gray);
      doc.text(
        item.personalizacionesSeleccionadas
          .map((option) => option.opcionNombre)
          .join(", ")
          .slice(0, 48),
        24,
        y + 4,
      );
      doc.setTextColor(...dark);
      y += 4;
    }
    doc.text(String(item.cantidad), 128, y, { align: "right" });
    doc.text(formatCurrency(getItemUnitPrice(item)), 156, y, { align: "right" });
    doc.text(formatCurrency(lineTotal), 186, y, { align: "right" });
    y += 10;
  });

  y += 8;
  doc.line(120, y, 190, y);
  y += 8;
  doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, 190, y, {
    align: "right",
  });
  y += 7;
  doc.text(`Descuento: ${formatCurrency(order.descuento)}`, 190, y, {
    align: "right",
  });
  y += 7;
  doc.text(`IVA (19%): ${formatCurrency(order.iva)}`, 190, y, {
    align: "right",
  });
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...violet);
  doc.setFontSize(13);
  doc.text(`Total: ${formatCurrency(order.total)}`, 190, y, {
    align: "right",
  });

  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Documento equivalente - no es factura electrónica DIAN (simulación).",
    20,
    276,
  );

  doc.save(`NovaBite-${order.numeroFactura}.pdf`);
}
