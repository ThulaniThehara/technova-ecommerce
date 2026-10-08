"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { btnPrimary, input, inputError, label } from "@/lib/ui";
import { type ProfileFieldErrors, profileSchema } from "@/lib/validations";

export default function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ name, phone });
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const dirty = values.name !== name || values.phone !== phone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !dirty) return;
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors as ProfileFieldErrors);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (res.status === 401) {
        router.push("/login?redirect=/account");
        return;
      }
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        toast.error(json.message ?? "Could not update your profile");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const err = (k: keyof ProfileFieldErrors) =>
    errors[k]?.[0] ? <p className="mt-1.5 text-sm font-medium text-red-600">{errors[k]![0]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className={label}>Full Name</label>
        <input
          id="name"
          value={values.name}
          maxLength={100}
          aria-invalid={!!errors.name}
          onChange={(e) => {
            setValues((v) => ({ ...v, name: e.target.value }));
            setErrors((p) => ({ ...p, name: undefined }));
          }}
          className={errors.name ? inputError : input}
        />
        {err("name")}
      </div>
      <div>
        <label htmlFor="email" className={label}>Email Address</label>
        <input id="email" value={email} disabled readOnly className={`${input} cursor-not-allowed bg-surface text-slate-500`} />
        <p className="mt-1.5 text-xs text-slate-500">Your email is your sign-in and cannot be changed here.</p>
      </div>
      <div>
        <label htmlFor="phone" className={label}>Phone Number</label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          maxLength={12}
          aria-invalid={!!errors.phone}
          onChange={(e) => {
            setValues((v) => ({ ...v, phone: e.target.value }));
            setErrors((p) => ({ ...p, phone: undefined }));
          }}
          className={errors.phone ? inputError : input}
        />
        {err("phone")}
      </div>
      <button type="submit" disabled={saving || !dirty} className={`${btnPrimary} px-7`}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
