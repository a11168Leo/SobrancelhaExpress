import React from 'react';
import DashboardCard from '../../components/admin/DashboardCards';
import Calendar from '../../components/admin/Calendar';
import AgendaTable from '../../components/admin/AgendaTable';
import { Users, Calendar as CalIcon, DollarSign } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <DashboardCard title="Clientes" value="120" icon={Users} />
        <DashboardCard title="Agendamentos" value="12" icon={CalIcon} />
        <DashboardCard title="Receita Prevista" value="R$ 1.200" icon={DollarSign} />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px', background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Calendar />
        </div>
        <div style={{ flex: '1 1 300px', background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <AgendaTable />
        </div>
      </div>
    </div>
  );
}