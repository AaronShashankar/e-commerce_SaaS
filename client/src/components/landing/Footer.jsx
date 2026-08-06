import { Link } from "react-router-dom";

const links = {
  Marketplace: ["All Products", "Categories", "Deals & Offers", "New Arrivals"],
  Sellers: ["Become a Seller", "Seller Guide", "Seller Dashboard", "Support"],
  Company: ["About Us", "Careers", "Blog", "Press"],
  Legal: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Refund Policy"],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-sm font-black text-white">M</span>
              </div>
              <span className="text-lg font-bold text-white">MarketPlace</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Nepal&apos;s trusted marketplace connecting local sellers with
              buyers across the country.
            </p>
            <div className="mt-4 flex gap-3">
              {["𝕏", "f", "in", "▶"].map((s) => (
                <button
                  key={s}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-xs hover:border-indigo-500 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-200">
                {heading}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-sm hover:text-indigo-400 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs">
            © {new Date().getFullYear()} MarketPlace. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs">Made with ❤️ in Nepal</span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-xs">🇳🇵</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
