import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthLayout from "../../components/common/AuthLayout.jsx";
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
    businessName: "",
    businessAddress: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    setBusy(true);
    try {
      await register(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Create your account"
      footer={
        <>
          Already registered?{" "}
          <Link
            className="font-medium text-indigo-600 hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <fieldset>
          <legend className="text-sm font-medium">I want to</legend>
          <div className="mt-2 flex gap-4">
            <label>
              <input
                className="mr-1"
                type="radio"
                value="buyer"
                checked={form.role === "buyer"}
                onChange={set("role")}
              />
              shop
            </label>
            <label>
              <input
                className="mr-1"
                type="radio"
                value="seller"
                checked={form.role === "seller"}
                onChange={set("role")}
              />
              sell
            </label>
          </div>
        </fieldset>
        <label className="block text-sm font-medium">
          Email
          <input
            className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
            type="email"
            required
            value={form.email}
            onChange={set("email")}
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
            type="password"
            minLength="8"
            required
            value={form.password}
            onChange={set("password")}
          />
        </label>
        <label className="block text-sm font-medium">
          Confirm password
          <input
            className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
            type="password"
            minLength="8"
            required
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
          />
        </label>
        {form.role === "seller" && (
          <>
            <label className="block text-sm font-medium">
              Business name
              <input
                className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
                required
                value={form.businessName}
                onChange={set("businessName")}
              />
            </label>
            <label className="block text-sm font-medium">
              Business address
              <textarea
                className="mt-1 w-full rounded-lg border p-2.5 focus:border-indigo-500 focus:outline-none"
                required
                value={form.businessAddress}
                onChange={set("businessAddress")}
              />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
