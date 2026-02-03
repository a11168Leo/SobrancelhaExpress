import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';  // Nova tela unificada
import Dashboard from '../pages/admin/Dashboard';
import ProfessionalLayout from '../layouts/ProfessionalLayout';
// Importe ClientBooking quando criar

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('@SobrancelhaExpress:token');
  const user = JSON.parse(localStorage.getItem('@SobrancelhaExpress:user'));
  if (!token) return <Navigate to="/" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />  // Login + Register unificados
        
        <Route path="/professional" element={
          <PrivateRoute roles={['admin', 'professional']}>
            <ProfessionalLayout />
          </PrivateRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        
        {/* Para cliente - adicione quando pronto */}
        <Route path="/cliente/agendar" element={
          <PrivateRoute roles={['client']}>
            {/* <ClientBooking /> */}
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};