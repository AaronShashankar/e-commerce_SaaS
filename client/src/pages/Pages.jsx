import { useAuth } from "../hooks/useAuth.js";
function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="flex items-center justify-between">
        <span className="font-bold text-indigo-700">MarketPlace</span>
        <div className="flex items-center gap-3 text-sm">
          <span>{user.email}</span>
          <button className="rounded border px-3 py-1.5" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      {children}
    </main>
  );
}
export function BuyerHome() {
  return (
    <Shell>
      <section className="mt-14 rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">Start shopping</h1>
        <p className="mt-2 text-slate-600">
          Your buyer account is ready. The product catalogue will appear here.
        </p>
      </section>
    </Shell>
  );
}
export function SellerDashboard() {
  return (
    <Shell>
      <section className="mt-14 rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">Seller dashboard</h1>
        <p className="mt-2 text-slate-600">
          Your account has been approved. You can now manage products here.
        </p>
      </section>
    </Shell>
  );
}
export function SellerPending({ seller }) {
  return (
    <Shell>
      <section className="mt-14 rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold">
          Your seller account is awaiting admin approval
        </h1>
        <p className="mt-2 text-slate-700">
          You can sign in, but product listing will be available after approval.
          We received your application for{" "}
          <strong>{seller?.businessName}</strong>.
        </p>
      </section>
    </Shell>
  );
}

export function SellerRejected({ seller }) {
  return (
    <Shell>
      <section className="mt-14 rounded-2xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-bold">
          Your seller application was not approved
        </h1>
        <p className="mt-2 text-slate-700">
          {seller.rejectionReason || "No reason was provided."}
        </p>
        <a
          className="mt-5 inline-block text-indigo-700 underline"
          href="mailto:support@example.com?subject=Seller%20application"
        >
          Contact support or re-apply
        </a>
      </section>
    </Shell>
  );
}

export function Unauthorized() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="mt-2">You do not have access to this page.</p>
    </main>
  );
}
