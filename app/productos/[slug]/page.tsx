import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/menu/product-detail-client";
import { getProductoPorSlug, getProductos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductoPorSlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProductos(product.categoria);
  const related = allProducts
    .filter((item) => item._id !== product._id)
    .slice(0, 3);

  return <ProductDetailClient product={product} related={related} />;
}
