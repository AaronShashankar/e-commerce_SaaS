import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center">Loading session…</p>;
  return user?.role === "admin" ? children : <Navigate to="/login" replace />;
}
