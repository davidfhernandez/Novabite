import { ProductsManager } from "@/components/admin/products-manager";
import { getProductos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProductos();
  return <ProductsManager initialProducts={products} />;
}
