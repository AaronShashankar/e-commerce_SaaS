import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import AuthLayout from "../../components/common/AuthLayout.jsx";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function RegisterBuyer() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      await register({ ...form, role: "buyer" });
      navigate("/", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || "Unable to create account. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create buyer account"
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-medium text-indigo-600 hover:underline" to="/login">
            Sign in
          </Link>
          {" · "}
          <Link className="font-medium text-indigo-600 hover:underline" to="/register/seller">
            Sell instead?
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={fieldErrors.firstName?.[0]}>
            <input
              id="buyer-firstName"
              className={input}
              value={form.firstName}
              onChange={set("firstName")}
              autoComplete="given-name"
              required
            />
          </Field>
          <Field label="Last name" error={fieldErrors.lastName?.[0]}>
            <input
              id="buyer-lastName"
              className={input}
              value={form.lastName}
              onChange={set("lastName")}
              autoComplete="family-name"
              required
            />
          </Field>
        </div>

        <Field label="Email address" error={fieldErrors.email?.[0]}>
          <input
            id="buyer-email"
            className={input}
            type="email"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Phone number" error={fieldErrors.phone?.[0]}>
          <input
            id="buyer-phone"
            className={input}
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+977 98XXXXXXXX"
            autoComplete="tel"
            required
          />
        </Field>

        <Field label="Password" error={fieldErrors.password?.[0]}>
          <input
            id="buyer-password"
            className={input}
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-slate-400">Min 8 chars, must include a number</p>
        </Field>

        <Field label="Confirm password" error={fieldErrors.confirmPassword?.[0]}>
          <input
            id="buyer-confirmPassword"
            className={input}
            type="password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
            required
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          id="buyer-register-submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
