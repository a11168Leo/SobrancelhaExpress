import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import ClientBooking from '../pages/client/Booking';

const PrivateRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('@SobrancelhaExpress:user'));
  const token = localStorage.getItem('@SobrancelhaExpress:token');

  if (!token) return <Navigate to="/" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;

  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rota Protegida do Leonardo (Admin) */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute roleRequired="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Rota Protegida do Cliente */}
        <Route path="/cliente/agendar" element={
          <PrivateRoute roleRequired="client">
            <ClientBooking />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}