import { Link } from "react-router-dom";

// Placeholder product data until real catalog is wired up
const featured = [
  { id: 1, name: "Handwoven Dhaka Fabric", price: "NPR 1,200", seller: "Bhaktapur Crafts", badge: "Trending", rating: 4.8 },
  { id: 2, name: "Himalayan Honey (500g)", price: "NPR 650", seller: "Mountain Harvest", badge: "Best Seller", rating: 4.9 },
  { id: 3, name: "Pashmina Shawl", price: "NPR 3,500", seller: "Nepal Threads", badge: "Premium", rating: 4.7 },
  { id: 4, name: "Organic Turmeric Powder", price: "NPR 220", seller: "Green Earth Co.", badge: null, rating: 4.6 },
  { id: 5, name: "Handmade Lokta Paper Journal", price: "NPR 480", seller: "Artisan Kathmandu", badge: "New", rating: 4.5 },
  { id: 6, name: "Brass Singing Bowl", price: "NPR 1,800", seller: "Sound Healing Nepal", badge: "Popular", rating: 4.9 },
];

const badgeColors = {
  Trending: "bg-orange-100 text-orange-700",
  "Best Seller": "bg-emerald-100 text-emerald-700",
  Premium: "bg-violet-100 text-violet-700",
  New: "bg-blue-100 text-blue-700",
  Popular: "bg-pink-100 text-pink-700",
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-400">★</span>
      <span className="text-xs font-medium text-slate-600">{rating}</span>
    </div>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 text-slate-500">Handpicked from our best verified sellers</p>
          </div>
          <Link
            to="/register"
            className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-800 sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <Link
              key={product.id}
              to="/register"
              className="group rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image placeholder */}
              <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 to-indigo-50">
                <span className="text-5xl opacity-40">🛍️</span>
                {product.badge && (
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[product.badge] || "bg-slate-100 text-slate-600"}`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-indigo-600 font-medium">{product.seller}</p>
                <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">{product.price}</span>
                  <StarRating rating={product.rating} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/register"
            className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}
