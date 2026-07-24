import { useAuth } from "../context/AuthContext.jsx";
export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">Administration</p>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
        </div>
        <button className="rounded border px-3 py-1.5" onClick={logout}>
          Log out
        </button>
      </header>
      <section className="mt-10 rounded-2xl bg-white p-8 shadow">
        <p>Signed in as {user.email}.</p>
        <p className="mt-2 text-slate-600">
          Seller approval management can be added here next.
        </p>
      </section>
    </main>
  );
}
