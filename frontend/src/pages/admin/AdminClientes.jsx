import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { FiPlus } from 'react-icons/fi';
import api, { API_BASE_URL } from '../../api/api.js';

// --- CONFIGURAÇÕES E FUNÇÕES AUXILIARES ---
const RECENT_VISIT_DAYS = 60;

// Função para definir qual contato exibir na tabela
const getContactText = (client) => {
  const phone = client.phone?.trim();
  if (phone) return phone;
  return client.email || '-';
};

function AdminClientes() {
  // --- ESTADOS DO COMPONENTE ---
  const [clientes, setClientes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de Interface e Filtros
  const [search, setSearch] = useState('');
  const [visitFilter, setVisitFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Estados do Modal de Criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // --- 1. BUSCA DE DADOS NA API ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [clientsRes, appointmentsRes] = await Promise.all([
          api.get('/team/clients'),
          api.get('/appointments/all'),
        ]);
        setClientes(clientsRes.data.users || []);
        setAppointments(appointmentsRes.data.appointments || []);
      } catch (err) {
        setError('Não foi possível carregar os clientes.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. PROCESSAMENTO DE DADOS (CLEAN CODE) ---
  // Mapeia os agendamentos para cada cliente de forma otimizada
  const appointmentStatsByClient = useMemo(() => {
    const map = new Map();
    for (const item of appointments) {
      const clientId = item.client?._id;
      if (!clientId) continue;
      
      const current = map.get(clientId) || { count: 0, last: null };
      const nextCount = current.count + 1;
      
      // Verifica se é a visita mais recente
      const last = !current.last || new Date(item.startTime) > new Date(current.last.startTime)
        ? item
        : current.last;
        
      map.set(clientId, { count: nextCount, last });
    }
    return map;
  }, [appointments]);

  // Prepara as linhas da tabela combinando clientes e seus agendamentos
  const rows = useMemo(() => {
    const now = dayjs();
    return clientes.map((client) => {
      const stats = appointmentStatsByClient.get(client._id) || { count: 0, last: null };
      const lastVisit = stats.last?.startTime ? dayjs(stats.last.startTime) : null;
      const inactiveDays = lastVisit ? now.diff(lastVisit, 'day') : null;
      const isRecent = inactiveDays !== null && inactiveDays <= RECENT_VISIT_DAYS;

      return {
        id: client._id,
        name: client.name || 'Cliente',
        email: client.email || '-',
        phone: client.phone || '',
        avatar: client.avatar || '',
        contact: getContactText(client),
        totalAppointments: stats.count,
        lastService: stats.last?.service?.name || '-',
        lastVisit,
        lastVisitText: lastVisit ? lastVisit.format('DD/MM/YYYY') : '-',
        statusLabel: lastVisit ? (isRecent ? 'Ativa' : 'Inativa') : 'Sem visita',
        statusClass: lastVisit ? (isRecent ? 'active' : 'inactive') : 'empty',
      };
    });
  }, [appointmentStatsByClient, clientes]);

  // Calcula o resumo para os cards do topo
  const summary = useMemo(() => {
    const active = rows.filter((item) => item.statusClass === 'active').length;
    const withPhone = rows.filter((item) => item.phone).length;
    const withoutVisits = rows.filter((item) => item.totalAppointments === 0).length;
    return { active, withPhone, withoutVisits };
  }, [rows]);

  // Aplica a busca, os filtros e a ordenação
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = rows.filter((item) => {
      // Filtro de texto
      const matchesSearch = !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.contact.toLowerCase().includes(normalizedSearch) ||
        item.lastService.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      // Filtro de status
      if (visitFilter === 'active') return item.statusClass === 'active';
      if (visitFilter === 'inactive') return item.statusClass === 'inactive';
      if (visitFilter === 'empty') return item.statusClass === 'empty';
      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      if (sortBy === 'appointments') return b.totalAppointments - a.totalAppointments;
      
      const aDate = a.lastVisit?.valueOf() || 0;
      const bDate = b.lastVisit?.valueOf() || 0;
      return bDate - aDate;
    });

    return filtered;
  }, [rows, search, visitFilter, sortBy]);

  // --- 3. AÇÕES (CRIAR CLIENTE) ---
  const handleCreateClient = async () => {
    setFormError('');
    if (!form.name || !form.email || !form.password) {
      setFormError('Preencha nome, email e senha.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/auth/users', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'cliente',
      });
      
      const created = res.data.user;
      
      // Atualiza a lista localmente para não precisar recarregar a página
      setClientes((prev) => [
        {
          _id: created._id || created.id,
          name: created.name,
          email: created.email,
          phone: created.phone || '',
          avatar: created.avatar || '',
        },
        ...prev,
      ]);
      
      // Limpa e fecha o formulário
      setForm({ name: '', email: '', phone: '', password: '' });
      setIsCreateOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Não foi possível adicionar o cliente.');
    } finally {
      setSaving(false);
    }
  };

  // --- 4. RENDERIZAÇÃO DA INTERFACE ---
  return (
    <section className="page">
      {/* Cabeçalho */}
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p className="page-subtitle">Base de clientes com busca, status e últimos atendimentos.</p>
        </div>
        <div className="clientes-header-badge">{filteredRows.length} exibidos</div>
      </div>

      {/* Cards de Resumo */}
      <div className="stats-grid">
        <article className="card">
          <h3>Total de clientes</h3>
          <div className="clientes-stat-value">{rows.length}</div>
          <p>Base cadastrada</p>
        </article>
        <article className="card">
          <h3>Clientes ativos</h3>
          <div className="clientes-stat-value">{summary.active}</div>
          <p>Visita nos últimos {RECENT_VISIT_DAYS} dias</p>
        </article>
        <article className="card">
          <h3>Com telefone</h3>
          <div className="clientes-stat-value">{summary.withPhone}</div>
          <p>Contato rápido disponível</p>
        </article>
        <article className="card">
          <h3>Sem visitas</h3>
          <div className="clientes-stat-value">{summary.withoutVisits}</div>
          <p>Ainda sem histórico</p>
        </article>
        
        {/* Botão de Criar Cliente */}
        <article className="card clientes-create-card">
          <button
            className="clientes-create-toggle"
            type="button"
            onClick={() => {
              setFormError('');
              setIsCreateOpen(true);
            }}
            aria-expanded={isCreateOpen}
          >
            <span className="clientes-create-plus">
              <FiPlus size={22} />
            </span>
            <span>
              <strong>Adicionar cliente</strong>
              <small>Cadastro rápido pela equipe</small>
            </span>
          </button>
        </article>
      </div>

      {/* Área Principal: Tabela e Filtros */}
      <div className="card clientes-card">
        <div className="clientes-toolbar">
          <input
            className="search clientes-search"
            type="search"
            placeholder="Buscar por nome, contato ou serviço"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="search clientes-filter"
            value={visitFilter}
            onChange={(event) => setVisitFilter(event.target.value)}
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
            <option value="empty">Sem visita</option>
          </select>
          <select
            className="search clientes-filter"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="recent">Ordenar por última visita</option>
            <option value="name">Ordenar por nome</option>
            <option value="appointments">Ordenar por atendimentos</option>
          </select>
        </div>

        {/* Feedbacks de Carregamento/Erro */}
        {loading && <p className="clientes-feedback">Carregando clientes...</p>}
        {!loading && error && <p className="clientes-feedback error">{error}</p>}

        {/* Tabela de Dados */}
        {!loading && !error && (
          <div className="clientes-table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Último serviço</th>
                  <th>Atendimentos</th>
                  <th>Última visita</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="clientes-user">
                        {item.avatar ? (
                          <img
                            src={item.avatar.startsWith('http') ? item.avatar : `${API_BASE_URL}${item.avatar}`}
                            alt={item.name}
                            className="clientes-avatar"
                          />
                        ) : (
                          <div className="clientes-avatar clientes-avatar-fallback">
                            {item.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <strong>{item.name}</strong>
                          <p>{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{item.contact}</td>
                    <td>{item.lastService}</td>
                    <td>{item.totalAppointments}</td>
                    <td>{item.lastVisitText}</td>
                    <td>
                      <span className={`clientes-status ${item.statusClass}`}>{item.statusLabel}</span>
                    </td>
                  </tr>
                ))}
                
                {/* Mensagem quando a busca não encontra nada */}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6}>Nenhum cliente encontrado para o filtro atual.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DE CRIAÇÃO --- */}
      {isCreateOpen && (
        <div className="clientes-modal-backdrop" onClick={() => !saving && setIsCreateOpen(false)}>
          <div className="clientes-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="salon-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>Adicionar novo cliente</h3>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>
                  Preencha os dados para criar o cadastro.
                </p>
              </div>
              <button className="btn btn-admin-clientes" type="button" onClick={() => setIsCreateOpen(false)} disabled={saving}>
                Fechar
              </button>
            </div>

            <div className="clientes-create-form">
              <input
                className="search"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="search"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="search"
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <input
                className="search"
                placeholder="Senha provisória"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              
              {formError && <p className="clientes-feedback error">{formError}</p>}
              
              <div className="clientes-create-actions">
                <button className="btn btn-admin-clientes" type="button" onClick={() => setIsCreateOpen(false)} disabled={saving}>
                  Cancelar
                </button>
                <button className="btn btn-admin-clientes clientes-create-submit" type="button" onClick={handleCreateClient} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminClientes;