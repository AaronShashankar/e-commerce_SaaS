import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import RegisterBuyer from "./pages/auth/RegisterBuyer.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import {
  BuyerHome,
  SellerDashboard,
  Unauthorized,
} from "./pages/Pages.jsx";
import SellerStatusGate from "./components/seller/SellerStatusGate.jsx";
import SellerOnboarding from "./pages/seller-onboarding/SellerOnboarding.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import { useAuth } from "./hooks/useAuth.js";

/** Root "/" handler: show landing if logged out, role-based redirect if logged in */
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center text-slate-500">Loading…</p>;
  if (!user) return <LandingPage />;
  if (user.role === "seller") return <Navigate to="/seller/dashboard" replace />;
  if (user.role === "buyer") return <Navigate to="/shop" replace />;
  return <LandingPage />;
}

/** Seller onboarding wrapper — reads ?resubmit=true from the URL */
function OnboardingRoute() {
  const [params] = useSearchParams();
  const isResubmit = params.get("resubmit") === "true";
  return <SellerOnboarding isResubmit={isResubmit} />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterBuyer />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Seller onboarding — accessible to unauthenticated (step 1) and authenticated sellers */}
      <Route path="/register/seller" element={<SellerOnboarding />} />

      {/* Authenticated seller onboarding resume / resubmit */}
      <Route
        path="/seller/onboarding"
        element={
          <ProtectedRoute roles={["seller"]}>
            <OnboardingRoute />
          </ProtectedRoute>
        }
      />

      {/* Buyer home */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute roles={["buyer"]}>
            <BuyerHome />
          </ProtectedRoute>
        }
      />

      {/* Seller dashboard (guarded by SellerStatusGate) */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute roles={["seller"]}>
            <SellerStatusGate>
              <SellerDashboard />
            </SellerStatusGate>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
