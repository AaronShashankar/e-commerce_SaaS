import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { BuyerHome, SellerDashboard, SellerPending, Unauthorized } from './pages/Pages.jsx'

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="/" element={<ProtectedRoute roles={['buyer']}><BuyerHome /></ProtectedRoute>} />
    <Route path="/seller/pending" element={<ProtectedRoute roles={['seller']}><SellerPending /></ProtectedRoute>} />
    <Route path="/seller/dashboard" element={<ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
