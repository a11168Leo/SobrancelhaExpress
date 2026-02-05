import { Navigate, Route, Routes } from 'react-router-dom'
import './css/App.css'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminAgendamentos from './pages/admin/AdminAgendamentos.jsx'
import AdminClientes from './pages/admin/AdminClientes.jsx'
import AdminServicos from './pages/admin/AdminServicos.jsx'
import AdminFinanceiro from './pages/admin/AdminFinanceiro.jsx'
import AdminRelatorio from './pages/admin/AdminRelatorio.jsx'
import AdminPerfil from './pages/admin/AdminPerfil.jsx'
import AdminNotificacoes from './pages/admin/AdminNotificacoes.jsx'
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes.jsx'
import AdminEquipe from './pages/admin/AdminEquipe.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireRole from './components/RequireRole.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ProfessionalLayout from './layouts/ProfessionalLayout.jsx'
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard.jsx'
import ProfessionalAgendamentos from './pages/professional/ProfessionalAgendamentos.jsx'
import ProfessionalServicos from './pages/professional/ProfessionalServicos.jsx'
import ProfessionalFinanceiro from './pages/professional/ProfessionalFinanceiro.jsx'
import ProfessionalPerfil from './pages/professional/ProfessionalPerfil.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esqueceu-senha" element={<ForgotPassword />} />
      <Route path="/resetar-senha" element={<ResetPassword />} />
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="agendamentos" element={<AdminAgendamentos />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="servicos" element={<AdminServicos />} />
        <Route path="financeiro" element={<AdminFinanceiro />} />
        <Route path="relatorio" element={<AdminRelatorio />} />
        <Route path="equipe" element={<AdminEquipe />} />
        <Route path="perfil" element={<AdminPerfil />} />
        <Route path="notificacoes" element={<AdminNotificacoes />} />
        <Route path="configuracoes" element={<AdminConfiguracoes />} />
      </Route>
      <Route
        path="/profissional"
        element={
          <RequireRole role="profissional">
            <ProfessionalLayout />
          </RequireRole>
        }
      >
        <Route path="dashboard" element={<ProfessionalDashboard />} />
        <Route path="agendamentos" element={<ProfessionalAgendamentos />} />
        <Route path="servicos" element={<ProfessionalServicos />} />
        <Route path="financeiro" element={<ProfessionalFinanceiro />} />
        <Route path="perfil" element={<ProfessionalPerfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}

export default App
