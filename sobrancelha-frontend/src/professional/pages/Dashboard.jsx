import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCards';
import AgendaTable from '../components/AgendaTable'; // Componente que criaremos abaixo
import { Calendar, Users, Euro, Star } from 'lucide-react';

export default function Dashboard() {
  // Estado para armazenar dados da base de dados
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    faturamentoMensal: 0,
    totalClientes: 0,
    avaliacao: 0
  });

  // Simulação de busca na base de dados (useEffect)
  useEffect(() => {
    // Aqui entrará seu fetch('/api/dashboard-stats')
    const fetchData = async () => {
      // Dados mockados para exemplo, fáceis de editar depois
      setStats({
        agendamentosHoje: "08",
        faturamentoMensal: "2.450",
        totalClientes: "154",
        avaliacao: "4.9"
      });
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#333', fontWeight: '700' }}>Visão Geral</h1>
        <p style={{ color: '#888' }}>Dados sincronizados com sua base de dados em tempo real.</p>
      </header>

      {/* Grid de Cards - Puxando do Estado (stats) */}
      <div className="dashboard-grid">
        <DashboardCard 
          title="Agendamentos Hoje" 
          value={stats.agendamentosHoje} 
          trend="Ver agenda" 
          icon={Calendar} 
        />
        <DashboardCard 
          title="Faturamento Mensal" 
          value={`€ ${stats.faturamentoMensal}`} 
          trend="↑ 15% este mês" 
          icon={Euro} 
        />
        <DashboardCard 
          title="Total de Clientes" 
          value={stats.totalClientes} 
          trend="Base ativa" 
          icon={Users} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginTop: '30px' }}>
        {/* Componente separado para facilitar edição futura */}
        <AgendaTable />
        
        {/* Card de Ação Rápida */}
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
           <h3 style={{ marginBottom: '15px' }}>Meta de Faturamento</h3>
           <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: '#D988B3' }}></div>
           </div>
           <p style={{ marginTop: '10px', fontSize: '14px' }}>70% da meta atingida</p>
        </div>
      </div>
    </div>
  );
}