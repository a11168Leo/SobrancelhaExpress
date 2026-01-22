// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import ProfessionalLayout from "./professional/ProfessionalLayout";

// Páginas do profissional
import Dashboard from "./professional/pages/Dashboard";
import Services from "./professional/pages/Services";
import Appointments from "./professional/pages/Appointments";
import Clients from "./professional/pages/Clients";
import Finance from "./professional/pages/Finance";
import Reports from "./professional/pages/Reports";
import Account from "./professional/pages/Account";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas do profissional */}
        <Route path="/professional" element={<ProfessionalLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clients" element={<Clients />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="account" element={<Account />} />
        </Route>

        {/* Redireciona a raiz "/" para dashboard */}
        <Route path="/" element={<Navigate to="/professional/dashboard" replace />} />

        {/* Caso tente acessar rota inexistente */}
        <Route path="*" element={<Navigate to="/professional/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
