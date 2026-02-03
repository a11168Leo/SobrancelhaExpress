import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import ProfessionalLayout from './layouts/ProfessionalLayout';

const PrivateRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('@SobrancelhaExpress:token');
  const user = JSON.parse(localStorage.getItem('@SobrancelhaExpress:user'));

  if (!token) return <Navigate to="/" />;
  if (roleRequired && user?.role !== roleRequired) return <Navigate to="/" />;

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/professional"
          element={
            <PrivateRoute roleRequired="admin">
              <ProfessionalLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
