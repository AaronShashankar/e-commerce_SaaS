import { useState } from "react";
import { z } from "zod";
import { useAuth } from "../../../hooks/useAuth.js";

const schema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[\d\s\-]{7,15}$/, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((v) => /\d/.test(v), "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Step1Account({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setServerError("");

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const data = await register({ ...parsed.data, role: "seller" });
      // data.user is now set in context; onSuccess advances wizard to step 2
      onSuccess(data.user);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setServerError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.[0]}>
          <input id="s1-firstName" className={inputCls} value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
        </Field>
        <Field label="Last name" error={errors.lastName?.[0]}>
          <input id="s1-lastName" className={inputCls} value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.[0]}>
        <input id="s1-email" className={inputCls} type="email" value={form.email} onChange={set("email")} autoComplete="email" />
      </Field>

      <Field label="Phone number" error={errors.phone?.[0]}>
        <input id="s1-phone" className={inputCls} type="tel" value={form.phone} onChange={set("phone")} placeholder="+977 98XXXXXXXX" />
      </Field>

      <Field label="Password" error={errors.password?.[0]}>
        <input id="s1-password" className={inputCls} type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
        <p className="mt-1 text-xs text-slate-400">Min 8 characters, must include a number</p>
      </Field>

      <Field label="Confirm password" error={errors.confirmPassword?.[0]}>
        <input id="s1-confirmPassword" className={inputCls} type="password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
      </Field>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
      )}

      <button
        id="s1-submit"
        disabled={busy}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {busy ? "Creating account…" : "Create account & continue →"}
      </button>
    </form>
  );
}
