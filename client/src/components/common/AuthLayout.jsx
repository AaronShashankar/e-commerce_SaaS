export default function AuthLayout({ title, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="mt-6">{children}</div>
        {footer && (
          <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>
        )}
      </section>
    </main>
  );
}
