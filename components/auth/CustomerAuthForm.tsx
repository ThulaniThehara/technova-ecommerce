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
        <div
          className={`flex items-center gap-3 border-b-2 py-2.5 transition-colors ${
            hasError
              ? "border-red-500"
              : "border-slate-200 focus-within:border-brand-600 hover:border-slate-300"
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
            className="w-full bg-transparent text-[15px] font-medium text-ink-900 placeholder:text-slate-400 outline-none"
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
        <div
          className={`flex items-center gap-3 border-b-2 py-2.5 transition-colors ${
            hasError
              ? "border-red-500"
              : "border-slate-200 focus-within:border-brand-600 hover:border-slate-300"
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
            className="w-full bg-transparent pr-2 text-[15px] font-medium text-ink-900 placeholder:text-slate-400 outline-none"
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
              placeholder: "Full Name",
              props: { autoComplete: "name", maxLength: 100 },
            })}
            {renderInputField({
              key: "phone",
              icon: <Phone className="h-5 w-5" />,
              placeholder: "Phone Number",
              props: { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 12 },
            })}
          </div>

          {renderInputField({
            key: "email",
            icon: <Mail className="h-5 w-5" />,
            placeholder: "Email ID",
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
              placeholder: "Password",
              autoComplete: "new-password",
              show: showPassword,
              toggleShow: () => setShowPassword((v) => !v),
            })}
            {renderPasswordField({
              key: "confirmPassword",
              placeholder: "Confirm Password",
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
            placeholder: "Email ID",
            props: {
              type: "email",
              autoComplete: "username",
              inputMode: "email",
              maxLength: 254,
            },
          })}

          {renderPasswordField({
            key: "password",
            placeholder: "Password",
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
              ? "Submit"
              : "Login"}
        </button>
      </div>

      {/* Social login for Login mode */}
      {!signup && (
        <>
          <div className="relative my-3 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              toast.info("Google Sign-In will be available soon. Please use your email and password.")
            }
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-surface/50 py-3 text-sm font-semibold text-ink-800 transition hover:border-slate-300 hover:bg-surface active:scale-[0.99]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Login with Google
          </button>
        </>
      )}

      {/* Bottom Switcher */}
      <p className="pt-2 text-center text-xs text-slate-500">
        {signup ? "Joined us before? " : "Don't have account then "}
        <Link
          href={switchHref(signup ? "/login" : "/signup")}
          className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline"
        >
          {signup ? "Login" : "Sign Up"}
        </Link>
      </p>
    </form>
  );
}
