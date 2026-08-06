import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 py-28 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <span className="mb-6 inline-block rounded-full border border-indigo-400/40 bg-indigo-800/50 px-4 py-1.5 text-sm font-medium text-indigo-200 backdrop-blur-sm">
          Nepal&apos;s growing marketplace
        </span>
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Buy, Sell &amp;
          <span className="block bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
            Grow Together
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-200/80">
          Discover thousands of products from verified local sellers — or launch
          your own store in minutes with our guided onboarding.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="group relative overflow-hidden rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-900 shadow-lg transition-all hover:shadow-indigo-500/30 hover:shadow-xl"
          >
            <span className="relative z-10">Start Shopping</span>
            <div className="absolute inset-0 -translate-x-full bg-indigo-50 transition-transform duration-300 group-hover:translate-x-0" />
          </Link>
          <Link
            to="/register/seller"
            className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Sell With Us →
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-3 divide-x divide-indigo-700/50 rounded-2xl border border-indigo-700/40 bg-indigo-900/50 backdrop-blur-sm">
          {[
            { label: "Active Sellers", value: "500+" },
            { label: "Products Listed", value: "10k+" },
            { label: "Happy Buyers", value: "25k+" },
          ].map(({ label, value }) => (
            <div key={label} className="py-6">
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="mt-1 text-sm text-indigo-300">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
