import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import NotificationBell from "./NotificationBell.jsx";

/** Dropdown shown when user clicks "Register" */
function RegisterDropdown({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-52 origin-top-right animate-[fadeIn_0.15s_ease] rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl"
      style={{ animation: "fadeIn 0.15s ease" }}
    >
      <Link
        to="/register"
        onClick={onClose}
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <span className="text-lg">🛍️</span>
        Register as Buyer
      </Link>
      <Link
        to="/register/seller"
        onClick={onClose}
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <span className="text-lg">🏪</span>
        Register as Seller
      </Link>
    </div>
  );
}

/** Role-aware nav links (right side when authenticated) */
function AuthenticatedNav({ user, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <NotificationBell />

      <div className="relative" ref={menuRef}>
        <button
          id="user-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-all"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {initials}
          </span>
          <span className="max-w-[100px] truncate">{user.firstName || user.email}</span>
          <svg className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
            {user.role === "buyer" && (
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                🛒 My Orders
              </Link>
            )}
            {user.role === "seller" && (
              <Link
                to="/seller/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                📊 Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="block w-full rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              → Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-300">
            <span className="text-sm font-black text-white">M</span>
          </div>
          <span className="text-lg font-bold text-slate-900">MarketPlace</span>
        </Link>

        {/* Right side */}
        {user ? (
          <AuthenticatedNav user={user} logout={logout} />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              id="nav-login-btn"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Log In
            </Link>

            {/* Register with dropdown */}
            <div className="relative">
              <button
                id="nav-register-btn"
                onClick={() => setRegisterOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Register
                <svg className={`h-4 w-4 transition-transform ${registerOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {registerOpen && (
                <RegisterDropdown onClose={() => setRegisterOpen(false)} />
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Fade-in keyframe injected inline */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </header>
  );
}
