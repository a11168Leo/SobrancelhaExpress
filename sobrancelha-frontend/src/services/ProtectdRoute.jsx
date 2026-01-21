// src/services/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn, requireRole } from "./authGuard";

const ProtectedRoute = ({ children, role }) => {
  if (!isLoggedIn()) return <Navigate to="/auth" replace />; // redireciona se não logado
  if (role && !requireRole(role)) return <Navigate to="/auth" replace />; // redireciona se role errada
  return children;
};

export default ProtectedRoute;
