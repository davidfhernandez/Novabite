import { IVA_RATE } from "@/lib/constants";
import { ItemCarrito, OrdenItem, ResumenCarrito } from "@/types";
import { roundPrice } from "@/lib/utils";

function getCustomizationSubtotal(
  item: Pick<ItemCarrito | OrdenItem, "cantidad" | "personalizacionesSeleccionadas">,
) {
  return item.personalizacionesSeleccionadas.reduce(
    (acc, option) => acc + option.precio * item.cantidad,
    0,
  );
}

export function getItemUnitPrice(
  item: Pick<ItemCarrito | OrdenItem, "precioBase" | "personalizacionesSeleccionadas">,
) {
  return item.precioBase + item.personalizacionesSeleccionadas.reduce((acc, option) => acc + option.precio, 0);
}

export function calculateSummary(
  items: Array<ItemCarrito | OrdenItem>,
  cupon?: string,
): ResumenCarrito {
  const baseSubtotal = items.reduce((acc, item) => acc + item.precioBase * item.cantidad, 0);
  const extras = items.reduce((acc, item) => acc + getCustomizationSubtotal(item), 0);
  const subtotal = roundPrice(baseSubtotal + extras);
  const descuento = cupon?.trim().toUpperCase() === "NOVA10" ? roundPrice(subtotal * 0.1) : 0;
  const baseGravable = subtotal - descuento;
  const iva = roundPrice(baseGravable * IVA_RATE);
  const total = roundPrice(baseGravable + iva);

  return {
    subtotal,
    descuento,
    iva,
    total,
  };
}
