
import Navbar from "../components/common/Navbar.jsx";
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
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

export function Unauthorized() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="mt-2">You do not have access to this page.</p>
    </main>
  );
}
