import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ProfessionalLayout from './professional/ProfessionalLayout';

// PÁGINAS DO PROFISSIONAL - VERIFIQUE SE TODAS ESTÃO IMPORTADAS ASSIM:
import Dashboard from './professional/pages/Dashboard';
import Services from './professional/pages/Services';
import Appointments from './professional/pages/Appointments';
import Clients from './professional/pages/Clients';
import Finance from './professional/pages/Finance';
import Reports from './professional/pages/Reports'; // <--- ESTA LINHA É A QUE DEVE ESTAR FALTANDO
import Account from './professional/pages/Account';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/professional/dashboard" replace />} />

        <Route path="/professional" element={<ProfessionalLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clients" element={<Clients />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;