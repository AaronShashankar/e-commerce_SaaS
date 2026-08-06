import { Link } from "react-router-dom";

const categories = [
  { icon: "👗", name: "Fashion", color: "from-pink-500 to-rose-500", count: "2.4k items" },
  { icon: "📱", name: "Electronics", color: "from-blue-500 to-cyan-500", count: "1.8k items" },
  { icon: "🏠", name: "Home & Living", color: "from-amber-500 to-orange-500", count: "3.1k items" },
  { icon: "🌿", name: "Health & Beauty", color: "from-emerald-500 to-green-500", count: "950 items" },
  { icon: "📚", name: "Books & Stationery", color: "from-violet-500 to-purple-500", count: "1.2k items" },
  { icon: "🛠️", name: "Tools & Hardware", color: "from-slate-500 to-gray-600", count: "680 items" },
];

export default function CategoryHighlights() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-slate-500">
            Find exactly what you&apos;re looking for in our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ icon, name, color, count }) => (
            <Link
              key={name}
              to="/register"
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-2xl shadow-sm transition-transform group-hover:scale-110`}
              >
                {icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">{name}</p>
                <p className="text-xs text-slate-400">{count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
