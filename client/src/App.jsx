import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import {
  BuyerHome,
  SellerDashboard,
  Unauthorized,
} from "./pages/Pages.jsx";
import SellerStatusGate from "./components/seller/SellerStatusGate.jsx";
import { useAuth } from "./hooks/useAuth.js";

/** Redirects to the correct home route for the logged-in user's role.
 *  Sellers → /seller/dashboard, everyone else → /login or /  */
function RoleBasedRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "seller") return <Navigate to="/seller/dashboard" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/"
        element={
          <ProtectedRoute roles={["buyer"]}>
            <BuyerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute roles={["seller"]}>
            <SellerStatusGate><SellerDashboard /></SellerStatusGate>
          </ProtectedRoute>
        }
      />
      {/* Catch-all: redirect each role to their correct home instead of blindly going to "/" */}
      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  );
}
