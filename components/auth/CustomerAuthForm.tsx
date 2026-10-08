"use client";

import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { customerLoginSchema, type SignupFieldErrors, signupSchema } from "@/lib/validations";

type Props = {
  mode: "login" | "signup";
  /** Where to go after success. Already validated on the server by safeRedirect(). */
  redirectTo: string;
};

type Values = { name: string; email: string; phone: string; password: string; confirmPassword: string };
const labels: Record<keyof Values, string> = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  password: "Password",
  confirmPassword: "Confirm password",
};
const empty: Values = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function CustomerAuthForm({ mode, redirectTo }: Props) {
  const signup = mode === "signup";
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    // Same schema the server uses, for instant feedback. The server validates again.
    const parsed = signup
      ? signupSchema.safeParse(values)
      : customerLoginSchema.safeParse({ email: values.email, password: values.password });
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error as z.ZodError).fieldErrors as SignupFieldErrors);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(signup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        setFormError(json.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      toast.success(signup ? "Account created. Welcome to TechNova!" : "Signed in");
      window.location.assign(redirectTo);
      return;
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const renderInputField = ({
    key,
    icon,
    placeholder,
    props = {},
  }: {
    key: keyof Values;
    icon: ReactNode;
    placeholder: string;
    props?: React.InputHTMLAttributes<HTMLInputElement>;
  }) => {
    const hasError = !!errors[key];
    return (
      <div className="group relative">
        <label htmlFor={key} className="mb-1.5 block text-sm font-semibold text-ink-900">
          {labels[key]}
        </label>
        <div
          className={`flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 transition ${
            hasError
              ? "border-red-400 focus-within:ring-4 focus-within:ring-red-100"
              : "border-line hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
          }`}
        >
          <span
            className={`shrink-0 transition-colors ${
              hasError ? "text-red-500" : "text-slate-400 group-focus-within:text-brand-600"
            }`}
          >
            {icon}
          </span>
          <input
            id={key}
            name={key}
            value={values[key]}
            onChange={set(key)}
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${key}-error` : undefined}
            className="w-full bg-transparent text-[15px] text-ink-900 placeholder:text-slate-400 outline-none"
            {...props}
          />
        </div>
        {hasError && (
          <p id={`${key}-error`} className="mt-1 text-xs font-medium text-red-600">
            {errors[key]![0]}
          </p>
        )}
      </div>
    );
  };

  const renderPasswordField = ({
    key,
    placeholder,
    autoComplete,
    show,
    toggleShow,
  }: {
    key: "password" | "confirmPassword";
    placeholder: string;
    autoComplete: string;
    show: boolean;
    toggleShow: () => void;
  }) => {
    const hasError = !!errors[key];
    return (
      <div className="group relative">
        <label htmlFor={key} className="mb-1.5 block text-sm font-semibold text-ink-900">
          {labels[key]}
        </label>
        <div
          className={`flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 transition ${
            hasError
              ? "border-red-400 focus-within:ring-4 focus-within:ring-red-100"
              : "border-line hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
          }`}
        >
          <span
            className={`shrink-0 transition-colors ${
              hasError ? "text-red-500" : "text-slate-400 group-focus-within:text-brand-600"
            }`}
          >
            <Lock className="h-5 w-5" />
          </span>
          <input
            id={key}
            name={key}
            type={show ? "text" : "password"}
            autoComplete={autoComplete}
            value={values[key]}
            onChange={set(key)}
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${key}-error` : undefined}
            className="w-full bg-transparent pr-2 text-[15px] text-ink-900 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={toggleShow}
            aria-label={show ? "Hide password" : "Show password"}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-ink-700"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {hasError && (
          <p id={`${key}-error`} className="mt-1 text-xs font-medium text-red-600">
            {errors[key]![0]}
          </p>
        )}
      </div>
    );
  };

  const switchHref = (to: "/login" | "/signup") =>
    redirectTo === "/account" ? to : `${to}?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
          {formError}
        </p>
      )}

      {/* Inputs */}
      {signup ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {renderInputField({
              key: "name",
              icon: <User className="h-5 w-5" />,
              placeholder: "e.g. Ashan Perera",
              props: { autoComplete: "name", maxLength: 100 },
            })}
            {renderInputField({
              key: "phone",
              icon: <Phone className="h-5 w-5" />,
              placeholder: "07X XXX XXXX",
              props: { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 12 },
            })}
          </div>

          {renderInputField({
            key: "email",
            icon: <Mail className="h-5 w-5" />,
            placeholder: "you@example.com",
            props: {
              type: "email",
              autoComplete: "email",
              inputMode: "email",
              maxLength: 254,
            },
          })}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {renderPasswordField({
              key: "password",
              placeholder: "At least 8 characters",
              autoComplete: "new-password",
              show: showPassword,
              toggleShow: () => setShowPassword((v) => !v),
            })}
            {renderPasswordField({
              key: "confirmPassword",
              placeholder: "Re-enter your password",
              autoComplete: "new-password",
              show: showConfirmPassword,
              toggleShow: () => setShowConfirmPassword((v) => !v),
            })}
          </div>
        </>
      ) : (
        <>
          {renderInputField({
            key: "email",
            icon: <Mail className="h-5 w-5" />,
            placeholder: "you@example.com",
            props: {
              type: "email",
              autoComplete: "username",
              inputMode: "email",
              maxLength: 254,
            },
          })}

          {renderPasswordField({
            key: "password",
            placeholder: "Enter your password",
            autoComplete: "current-password",
            show: showPassword,
            toggleShow: () => setShowPassword((v) => !v),
          })}
        </>
      )}

      {/* Forgot Password link for Login */}
      {!signup && (
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={() =>
              toast.info("To reset your password, please contact support at support@technova.lk or WhatsApp.")
            }
            className="text-xs font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      )}

      {/* Terms & Privacy note for Sign Up */}
      {signup && (
        <p className="pt-1 text-xs leading-relaxed text-slate-500">
          You agree to our{" "}
          <Link href="/terms" className="font-semibold text-brand-600 hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:bg-brand-600/60 active:scale-[0.99]"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting
            ? signup
              ? "Creating account..."
              : "Signing in..."
            : signup
              ? "Create account"
              : "Sign in"}
        </button>
      </div>

      {/* Bottom Switcher */}
      <p className="pt-2 text-center text-xs text-slate-500">
        {signup ? "Already have an account? " : "New to TechNova? "}
        <Link
          href={switchHref(signup ? "/login" : "/signup")}
          className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline"
        >
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
