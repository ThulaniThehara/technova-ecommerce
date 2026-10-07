"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { AdminProduct } from "@/lib/admin-products";
import { btnOutline, btnPrimary, card, input, inputError, label } from "@/lib/ui";
import { type ProductFieldErrors, productSchema } from "@/lib/validations";

type Props = {
  categories: { id: string; name: string }[];
  product?: AdminProduct; // present => edit mode, absent => create mode
};

type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
  isActive: boolean;
};

const toNumber = (v: string) => (v.trim() === "" ? NaN : Number(v));

// ONE form for both Add and Edit. It validates with the same Zod schema the API uses.
export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const editing = Boolean(product);

  const [form, setForm] = useState<FormState>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    stock: String(product?.stock ?? 0),
    imageUrl: product?.imageUrl ?? "",
    categoryId: product?.categoryId ?? "",
    isActive: product?.isActive ?? true,
  });
  const [errors, setErrors] = useState<ProductFieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const parsed = productSchema.safeParse({
      name: form.name,
      description: form.description,
      price: toNumber(form.price),
      stock: toNumber(form.stock),
      imageUrl: form.imageUrl,
      categoryId: form.categoryId,
      isActive: form.isActive,
    });
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors as ProductFieldErrors);
      toast.error("Please fix the highlighted fields");
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/products/${product!.id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        toast.error(json.message ?? "Could not save the product");
        return;
      }
      toast.success(editing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const error = (key: keyof ProductFieldErrors) =>
    errors[key]?.[0] ? (
      <p id={`${key}-error`} className="mt-1.5 text-sm font-medium text-red-600">
        {errors[key]![0]}
      </p>
    ) : null;

  const attrs = (key: keyof ProductFieldErrors) => ({
    id: key,
    name: key,
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    className: errors[key] ? inputError : input,
  });

  const previewable = /^https?:\/\//i.test(form.imageUrl.trim());

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-3">
      <section className={`${card} space-y-5 p-6 lg:col-span-2`}>
        <div>
          <label htmlFor="name" className={label}>Product name</label>
          <input {...attrs("name")} value={form.name} maxLength={120} onChange={(e) => set("name", e.target.value)} />
          {error("name")}
        </div>

        <div>
          <label htmlFor="description" className={label}>Description</label>
          <textarea
            {...attrs("description")}
            rows={5}
            maxLength={2000}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          {error("description")}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={label}>Price (LKR)</label>
            <input
              {...attrs("price")}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.price}
              placeholder="e.g. 129900"
              onChange={(e) => set("price", e.target.value)}
            />
            {error("price")}
          </div>
          <div>
            <label htmlFor="stock" className={label}>Stock quantity</label>
            <input
              {...attrs("stock")}
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
            {error("stock")}
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className={label}>Category</label>
          <select {...attrs("categoryId")} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {error("categoryId")}
        </div>

        <div>
          <label htmlFor="imageUrl" className={label}>
            Image URL <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            {...attrs("imageUrl")}
            type="url"
            inputMode="url"
            value={form.imageUrl}
            maxLength={500}
            placeholder="https://..."
            onChange={(e) => set("imageUrl", e.target.value)}
          />
          {error("imageUrl")}
          <p className="mt-1.5 text-xs text-slate-500">Leave empty to use a placeholder image.</p>
        </div>
      </section>

      <aside className="space-y-6">
        <section className={`${card} p-6`}>
          <h2 className="text-lg font-bold text-ink-900">Visibility</h2>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#1668f0]"
            />
            <span>
              <span className="block font-semibold text-ink-900">Active</span>
              <span className="block text-sm text-slate-500">Active products are visible and can be ordered in the store.</span>
            </span>
          </label>
        </section>

        <section className={`${card} p-6`}>
          <h2 className="text-lg font-bold text-ink-900">Image preview</h2>
          <div className="hatch mt-4 aspect-square overflow-hidden rounded-xl">
            {previewable && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl.trim()} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={`${btnPrimary} flex-1 py-3.5`}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {saving ? "Saving..." : editing ? "Save changes" : "Create product"}
          </button>
          <Link href="/admin/products" className={`${btnOutline} py-3.5`}>
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
