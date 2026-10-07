"use client";

import { Check, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminProduct } from "@/lib/admin-products";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

async function patchProduct(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? "Could not update the product");
}

// Remounted (via `key`) whenever the server value changes, so the draft never goes stale.
function StockEditor({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [value, setValue] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);

  const parsed = Number(value);
  const valid = value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= 100000;
  const dirty = valid && parsed !== product.stock;

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await patchProduct(product.id, { stock: parsed });
      toast.success(`${product.name}: stock set to ${parsed}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update stock");
      setValue(String(product.stock));
    } finally {
      setSaving(false);
    }
  }

  const low = product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        aria-label={`Stock for ${product.name}`}
        aria-invalid={!valid}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className={`w-20 rounded-lg border px-2.5 py-1.5 text-sm font-semibold outline-none transition focus:ring-4 ${
          !valid
            ? "border-red-400 focus:ring-red-100"
            : low
              ? "border-amber-300 bg-amber-50 text-amber-800 focus:border-amber-400 focus:ring-amber-100"
              : "border-line focus:border-brand-500 focus:ring-brand-100"
        }`}
      />
      {dirty && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          aria-label="Save stock"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

function ActiveToggle({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await patchProduct(product.id, { isActive: !product.isActive });
      toast.success(`${product.name} ${product.isActive ? "hidden from" : "visible in"} the store`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={product.isActive}
      aria-label={`${product.name} is ${product.isActive ? "active" : "inactive"}`}
      onClick={toggle}
      disabled={busy}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ${
        product.isActive ? "bg-brand-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          product.isActive ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function DeleteButton({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const hasOrders = product.orderCount > 0;

  async function remove() {
    if (!window.confirm(`Delete "${product.name}" permanently? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Could not delete the product");
      toast.success(`${product.name} deleted`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={hasOrders || busy}
      title={hasOrders ? "This product is on past orders. Deactivate it instead." : "Delete product"}
      aria-label={hasOrders ? `${product.name} cannot be deleted (it has orders)` : `Delete ${product.name}`}
      className="rounded-lg p-2 text-slate-400 transition enabled:hover:bg-red-50 enabled:hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

export default function ProductsTable({ products }: { products: AdminProduct[] }) {
  if (products.length === 0) {
    return <div className={`${card} px-6 py-14 text-center text-sm text-slate-500`}>No products yet. Add your first one.</div>;
  }

  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Product</th>
            <th className="px-5 py-3 font-semibold">Category</th>
            <th className="px-5 py-3 text-right font-semibold">Price</th>
            <th className="px-5 py-3 font-semibold">Stock</th>
            <th className="px-5 py-3 font-semibold">Active</th>
            <th className="px-5 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => (
            <tr key={p.id} className={p.isActive ? "" : "bg-surface/70"}>
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="hatch h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  </span>
                  <div className="min-w-0">
                    <p className={`truncate font-semibold ${p.isActive ? "text-ink-900" : "text-slate-500"}`}>{p.name}</p>
                    {!p.isActive && <p className="text-xs text-slate-500">Hidden from store</p>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-slate-600">{p.category.name}</td>
              <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-ink-900">{formatPrice(p.price)}</td>
              <td className="px-5 py-3">
                <StockEditor key={`${p.id}-${p.stock}`} product={p} />
              </td>
              <td className="px-5 py-3">
                <ActiveToggle product={p} />
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    aria-label={`Edit ${p.name}`}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-surface hover:text-brand-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton product={p} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
