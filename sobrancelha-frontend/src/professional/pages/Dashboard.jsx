import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCards';
import AgendaTable from '../components/AgendaTable';
import RevenueGoalCard from '../components/RevenueGoalCard';
import { Calendar, Users, Euro } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    faturamentoMensal: 0,
    faturamentoAnterior: 2100, // Mock para cálculo de %
    totalClientes: 0,
    crescimentoClientes: 12
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Buscando dados reais da sua API
        const response = await fetch('http://localhost:5000/api/clients');
        const data = await response.json();
        
        // Exemplo de lógica para extrair stats dos dados reais
        const hoje = new Date().toISOString().split('T')[0];
        const agendamentosHoje = data.length; // Ajustar conforme sua lógica de data
        const totalFaturado = 2450; // Idealmente vem de uma rota de faturamento

        setStats(prev => ({
          ...prev,
          agendamentosHoje: agendamentosHoje,
          faturamentoMensal: totalFaturado,
          totalClientes: data.length + 100 // Exemplo de base total
        }));
      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      }
    };
    fetchDashboardData();
  }, []);

  const diffFaturamento = ((stats.faturamentoMensal - stats.faturamentoAnterior) / stats.faturamentoAnterior) * 100;

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#333', fontWeight: '700' }}>Visão Geral</h1>
        <p style={{ color: '#888' }}>Bem-vinda de volta ao seu painel de controle.</p>
      </header>

      {/* Grid de Cards Principais */}
      <div className="dashboard-grid">
        <DashboardCard 
          title="Agendamentos Hoje" 
          value={stats.agendamentosHoje} 
          icon={Calendar}
          footer={<Link to="/calendario" style={{ color: '#D988B3', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Ver calendário →</Link>}
        />

        <DashboardCard 
          title="Faturamento" 
          value={`€ ${stats.faturamentoMensal.toLocaleString()}`} 
          icon={Euro}
          trend={`${diffFaturamento.toFixed(1)}% vs mês anterior`}
          trendColor={diffFaturamento >= 0 ? '#2ecc71' : '#e74c3c'}
        />

        <DashboardCard 
          title="Total de Clientes" 
          value={stats.totalClientes} 
          icon={Users}
          trend={`+${stats.crescimentoClientes}% aumento`}
          trendColor="#2ecc71"
        />
      </div>

      {/* Seção Inferior: Tabela e Meta */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px', 
        marginTop: '30px' 
      }}>
        
        {/* Tabela de Agendamentos (Ocupa mais espaço em telas grandes) */}
        <div style={{ gridColumn: 'span 2' }}>
          <AgendaTable />
        </div>
        
        {/* Card de Meta de Faturamento */}
        <div style={{ gridColumn: 'span 1' }}>
          <RevenueGoalCard faturamentoAtual={stats.faturamentoMensal} />
        </div>

      </div>
    </div>
  );
}