import Navbar from "../components/common/Navbar.jsx";
import Hero from "../components/landing/Hero.jsx";
import CategoryHighlights from "../components/landing/CategoryHighlights.jsx";
import FeaturedProducts from "../components/landing/FeaturedProducts.jsx";
import Footer from "../components/landing/Footer.jsx";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CategoryHighlights />
        <FeaturedProducts />

        {/* Seller CTA banner */}
        <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-16 text-white text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to start selling?
            </h2>
            <p className="mt-3 text-indigo-100">
              Join hundreds of verified sellers. Our guided 5-step onboarding
              gets you live in under 10 minutes.
            </p>
            <a
              href="/register/seller"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              Open Your Store →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
