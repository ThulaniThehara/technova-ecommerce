"use client";

import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { btnOutline, btnPrimary, input, inputError, label } from "@/lib/ui";
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

  const wrap = "relative";
  const icon = "pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Full name</label>
          <div className={wrap}>
            <User className={icon} aria-hidden />
            <input
              id="name"
              value={values.name}
              maxLength={100}
              autoComplete="name"
              aria-invalid={!!errors.name}
              onChange={(e) => {
                setValues((v) => ({ ...v, name: e.target.value }));
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={`${errors.name ? inputError : input} pl-10`}
            />
          </div>
          {err("name")}
        </div>

        <div>
          <label htmlFor="phone" className={label}>Phone number</label>
          <div className={wrap}>
            <Phone className={icon} aria-hidden />
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              maxLength={12}
              placeholder="07X XXX XXXX"
              aria-invalid={!!errors.phone}
              onChange={(e) => {
                setValues((v) => ({ ...v, phone: e.target.value }));
                setErrors((p) => ({ ...p, phone: undefined }));
              }}
              className={`${errors.phone ? inputError : input} pl-10`}
            />
          </div>
          {err("phone")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className={label}>Email address</label>
          <div className={wrap}>
            <Mail className={icon} aria-hidden />
            <input
              id="email"
              value={email}
              disabled
              readOnly
              className={`${input} cursor-not-allowed bg-surface pl-10 pr-28 text-slate-500`}
            />
            <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              <Lock className="h-3 w-3" aria-hidden /> Locked
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Your email is your sign-in, so it can&apos;t be changed here.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => {
            setValues({ name, phone });
            setErrors({});
          }}
          className={`${btnOutline} px-6`}
        >
          Discard changes
        </button>
        <button type="submit" disabled={saving || !dirty} className={`${btnPrimary} px-7`}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
