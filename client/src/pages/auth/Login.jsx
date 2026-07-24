import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthLayout from "../../components/common/AuthLayout.jsx";
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form);
      navigate(
        user.role === "seller"
          ? user.approvalStatus === "pending"
            ? "/seller/pending"
            : "/seller/dashboard"
          : location.state?.from?.pathname || "/",
        { replace: true },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Welcome back"
      footer={
        <Link
          className="font-medium text-indigo-600 hover:underline"
          to="/register"
        >
          Create an account
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium">
          Email
          <input
            className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
