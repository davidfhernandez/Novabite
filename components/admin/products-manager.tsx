"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Producto } from "@/types";
import { formatCurrency } from "@/lib/utils";

type ProductFormState = {
  nombre: string;
  descripcion: string;
  descripcionLarga: string;
  precio: string;
  categoria: Producto["categoria"];
  imagenes: string;
  rating: string;
  ingredientes: string;
  stock: string;
  destacado: boolean;
  disponible: boolean;
  etiquetas: string;
  personalizaciones: string;
};

const EMPTY_FORM: ProductFormState = {
  nombre: "",
  descripcion: "",
  descripcionLarga: "",
  precio: "25000",
  categoria: "hamburguesas",
  imagenes: "",
  rating: "4.8",
  ingredientes: "",
  stock: "10",
  destacado: false,
  disponible: true,
  etiquetas: "",
  personalizaciones: "[]",
};

export function ProductsManager({ initialProducts }: { initialProducts: Producto[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((product) =>
      `${product.nombre} ${product.categoria} ${product.descripcion}`.toLowerCase().includes(q),
    );
  }, [products, query]);

  function hydrateForm(product: Producto) {
    setEditingId(product._id);
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      descripcionLarga: product.descripcionLarga,
      precio: String(product.precio),
      categoria: product.categoria,
      imagenes: product.imagenes.join(", "),
      rating: String(product.rating),
      ingredientes: product.ingredientes.join(", "),
      stock: String(product.stock),
      destacado: product.destacado,
      disponible: product.disponible,
      etiquetas: product.etiquetas.join(", "),
      personalizaciones: JSON.stringify(product.personalizaciones, null, 2),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        descripcionLarga: form.descripcionLarga,
        precio: Number(form.precio),
        categoria: form.categoria,
        imagenes: form.imagenes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        rating: Number(form.rating),
        ingredientes: form.ingredientes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        stock: Number(form.stock),
        destacado: form.destacado,
        disponible: form.disponible,
        etiquetas: form.etiquetas
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        personalizaciones: JSON.parse(form.personalizaciones || "[]"),
      };

      const url = editingId ? `/api/productos/${editingId}` : "/api/productos";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "No se pudo guardar el producto");
      }

      const product = await response.json();
      setProducts((current) =>
        editingId
          ? current.map((item) => (item._id === editingId ? product : item))
          : [product, ...current],
      );
      resetForm();
      toast.success(editingId ? "Producto actualizado" : "Producto creado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("¿Eliminar este producto?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      setProducts((current) => current.filter((item) => item._id !== id));
      if (editingId === id) {
        resetForm();
      }
      toast.success("Producto eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="panel-strong rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              CRUD de productos
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {editingId ? "Editar producto" : "Crear producto"}
            </h1>
          </div>
          {editingId ? (
            <button type="button" className="button-secondary" onClick={resetForm}>
              Cancelar
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4">
          <input
            className="input-shell"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(event) => setForm({ ...form, nombre: event.target.value })}
          />
          <input
            className="input-shell"
            placeholder="Descripción corta"
            value={form.descripcion}
            onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
          />
          <textarea
            className="input-shell min-h-28"
            placeholder="Descripción larga"
            value={form.descripcionLarga}
            onChange={(event) =>
              setForm({ ...form, descripcionLarga: event.target.value })
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input-shell"
              placeholder="Precio"
              type="number"
              value={form.precio}
              onChange={(event) => setForm({ ...form, precio: event.target.value })}
            />
            <select
              className="input-shell"
              value={form.categoria}
              onChange={(event) =>
                setForm({
                  ...form,
                  categoria: event.target.value as Producto["categoria"],
                })
              }
            >
              <option value="hamburguesas">Hamburguesas</option>
              <option value="sushi">Sushi</option>
              <option value="vegano">Vegano</option>
              <option value="bebidas">Bebidas</option>
            </select>
            <input
              className="input-shell"
              placeholder="Rating"
              type="number"
              step="0.1"
              value={form.rating}
              onChange={(event) => setForm({ ...form, rating: event.target.value })}
            />
            <input
              className="input-shell"
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
            />
          </div>
          <input
            className="input-shell"
            placeholder="Imágenes separadas por coma"
            value={form.imagenes}
            onChange={(event) => setForm({ ...form, imagenes: event.target.value })}
          />
          <input
            className="input-shell"
            placeholder="Ingredientes separados por coma"
            value={form.ingredientes}
            onChange={(event) => setForm({ ...form, ingredientes: event.target.value })}
          />
          <input
            className="input-shell"
            placeholder="Etiquetas separadas por coma"
            value={form.etiquetas}
            onChange={(event) => setForm({ ...form, etiquetas: event.target.value })}
          />
          <textarea
            className="input-shell min-h-36 font-mono text-xs"
            placeholder='Personalizaciones en JSON. Ejemplo: [{"id":"extra","nombre":"Extras","opciones":[...]}]'
            value={form.personalizaciones}
            onChange={(event) =>
              setForm({ ...form, personalizaciones: event.target.value })
            }
          />
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(event) => setForm({ ...form, destacado: event.target.checked })}
              />
              Destacado
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.disponible}
                onChange={(event) => setForm({ ...form, disponible: event.target.checked })}
              />
              Disponible
            </label>
          </div>
          <button type="submit" className="button-primary" disabled={submitting}>
            <Plus className="mr-2 h-4 w-4" />
            {submitting ? "Guardando..." : editingId ? "Actualizar producto" : "Crear producto"}
          </button>
        </div>
      </form>

      <section className="space-y-6">
        <div className="panel rounded-[28px] p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="input-shell pl-11"
              placeholder="Buscar producto"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="panel-strong rounded-[30px] p-4 sm:p-5">
          {filtered.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
              {products.length === 0
                ? "Aún no hay productos registrados. Crea el primero desde este formulario."
                : "No encontramos productos con ese filtro. Prueba otra búsqueda."}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((product) => (
                <article
                  key={product._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{product.nombre}</h2>
                      {product.stock <= 5 ? (
                        <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-300">
                          Bajo stock
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">{product.descripcion}</p>
                    <p className="mt-3 text-sm">
                      {product.categoria} · {formatCurrency(product.precio)} · Stock {product.stock}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => hydrateForm(product)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="button-secondary text-red-300"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
