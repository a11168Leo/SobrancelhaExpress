import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Scissors, DollarSign, Clock, TrendingUp, 
  Search, Edit3, Trash2, ChevronRight, X,
  Image as ImageIcon, Loader2, Camera, Filter 
} from 'lucide-react';
import api from "../../services/api";
import { getProfessionalId } from "../../services/authGuard";
import "../css/profissional.css";

export default function Services() {
  // Estados de Dados
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // NOVO: Estado para armazenar a estrutura vinda do banco
  const [estruturaCategorias, setEstruturaCategorias] = useState({});

  // Estados de Filtro
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState("");

  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: "", price: "", duration: "", category: "", 
    subcategory: "", subcategory2: "", foto: null
  });

  useEffect(() => {
    fetchServices();
    fetchEstrutura(); // Busca as categorias do banco
  }, []);

  // Busca os serviços da profissional
  const fetchServices = async () => {
    try {
      setLoading(true);
      const profId = getProfessionalId();
      const res = await api.get(`/professional/services/${profId}`);
      setServices(res.data);
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    } finally {
      setLoading(false);
    }
  };

  // NOVO: Busca a árvore de categorias da base de dados
  const fetchEstrutura = async () => {
    try {
      // Ajuste o endpoint conforme sua API (ex: /categories ou /professional/config/categories)
      const res = await api.get('/categories/structure'); 
      setEstruturaCategorias(res.data);
    } catch (err) {
      console.error("Erro ao carregar estrutura de categorias:", err);
    }
  };

  // --- LÓGICA DE NEGÓCIO ---
  const stats = useMemo(() => {
    const total = services.length;
    const somaPrecos = services.reduce((acc, s) => acc + Number(s.price || 0), 0);
    const somaTempo = services.reduce((acc, s) => acc + Number(s.duration || 0), 0);
    return {
      total,
      mediaPreco: total > 0 ? (somaPrecos / total).toFixed(2) : "0.00",
      mediaTempo: total > 0 ? Math.round(somaTempo / total) : 0
    };
  }, [services]);

  const categoriasComContagem = useMemo(() => {
    const contagem = { "Todos": services.length };
    services.forEach(s => {
      if (s.category) contagem[s.category] = (contagem[s.category] || 0) + 1;
    });
    return Object.entries(contagem).map(([nome, total]) => ({ nome, total }));
  }, [services]);

  const filteredServices = services.filter(s => {
    const matchesCat = activeCategory === 'Todos' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // --- AÇÕES ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, foto: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const profId = getProfessionalId();
      const payload = { ...formData, professionalId: profId };
      
      if (editingId) {
        await api.put(`/professional/services/${editingId}`, payload);
      } else {
        await api.post('/professional/services', payload);
      }
      
      setIsModalOpen(false);
      setFormData({ name: "", price: "", duration: "", category: "", subcategory: "", subcategory2: "", foto: null });
      fetchServices();
    } catch (err) {
      alert("Erro ao salvar serviço");
    }
  };

  const handleEdit = (servico) => {
    setEditingId(servico._id);
    setFormData({
      name: servico.name,
      price: servico.price,
      duration: servico.duration,
      category: servico.category,
      subcategory: servico.subcategory,
      subcategory2: servico.subcategory2,
      foto: servico.foto
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este serviço?")) {
      try {
        await api.delete(`/professional/services/${id}`);
        fetchServices();
      } catch (err) {
        alert("Erro ao excluir");
      }
    }
  }

  return (
    <div className="serv-wrapper acc-fade-in">
      
      {/* 1. MÉTRICAS COMPACTAS */}
      <div className="serv-stats-grid">
        <div className="serv-mini-card">
          <div className="mini-icon purple"><Scissors size={18}/></div>
          <div><p className="mini-val">{stats.total}</p><p className="mini-label">Serviços</p></div>
        </div>
        <div className="serv-mini-card">
          <div className="mini-icon green"><DollarSign size={18}/></div>
          <div><p className="mini-val">€ {stats.mediaPreco}</p><p className="mini-label">Preço Médio</p></div>
        </div>
        <div className="serv-mini-card">
          <div className="mini-icon blue"><Clock size={18}/></div>
          <div><p className="mini-val">{stats.mediaTempo} min</p><p className="mini-label">Tempo Médio</p></div>
        </div>
        <div className="serv-mini-card">
          <div className="mini-icon pink"><TrendingUp size={18}/></div>
          <div><p className="mini-val">Ativo</p><p className="mini-label">Status Catálogo</p></div>
        </div>
      </div>

      {/* 2. CONTROLES */}
      <div className="serv-controls">
        <h2 className="serv-title">Gerenciar Serviços</h2>
        <div className="serv-search-wrapper">
          <div className="serv-search-input">
            <Search size={18} />
            <input 
              placeholder="Pesquisar serviço..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button className="acc-btn-primary" onClick={() => {setEditingId(null); setIsModalOpen(true)}}>
            <Plus size={18}/> Novo Serviço
          </button>
        </div>
      </div>

      <div className="serv-main-layout">
        <aside className="serv-aside">
          <h3 className="aside-title">Categorias</h3>
          <nav className="aside-nav">
            {categoriasComContagem.map(cat => (
              <button 
                key={cat.nome}
                onClick={() => setActiveCategory(cat.nome)}
                className={`aside-link ${activeCategory === cat.nome ? 'active' : ''}`}
              >
                <span className="cat-name">{cat.nome}</span>
                <span className="cat-badge">{cat.total}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="serv-grid">
          {loading ? (
             <div className="serv-loading"><Loader2 className="animate-spin" /></div>
          ) : filteredServices.map((s) => (
            <div key={s._id} className="serv-item-card">
              <div className="serv-img-container">
                {s.foto ? <img src={s.foto} alt={s.name} /> : <div className="img-placeholder"><ImageIcon size={30}/></div>}
                <div className="serv-price-badge">€ {s.price}</div>
              </div>
              <div className="serv-info">
                <h4>{s.name}</h4>
                <p className="serv-cat-label">{s.category} • {s.subcategory}</p>
                <div className="serv-footer">
                  <span className="serv-time"><Clock size={12}/> {s.duration} min</span>
                  <div className="serv-actions">
                    <button className="btn-edit-inline" onClick={() => handleEdit(s)}>Editar</button>
                    <button className="btn-delete-small" onClick={() => handleDelete(s._id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="serv-add-card" onClick={() => {setEditingId(null); setIsModalOpen(true)}}>
            <div className="add-circle"><Plus size={30}/></div>
            <p>Adicionar Novo</p>
          </button>
        </main>
      </div>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="cal-modal-overlay">
          <div className="cal-modal-content serv-modal acc-fade-in">
            <div className="cal-modal-header">
              <h3>{editingId ? "Editar Serviço" : "Novo Serviço"}</h3>
              <X className="close-icon" onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleSubmit} className="cal-form">
              <div className="modal-photo-upload">
                {formData.foto ? (
                  <div className="photo-preview">
                    <img src={formData.foto} alt="Preview" />
                    <button type="button" onClick={() => setFormData({...formData, foto: null})}><X size={12}/></button>
                  </div>
                ) : (
                  <label className="photo-placeholder">
                    <Camera size={24} />
                    <span>Foto do Trabalho</span>
                    <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
                  </label>
                )}
              </div>

              <div className="acc-input-group">
                <label>Nome do Serviço</label>
                <input required className="acc-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid-2">
                <div className="acc-input-group">
                  <label>Preço (€)</label>
                  <input required type="number" step="0.01" className="acc-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="acc-input-group">
                  <label>Duração (min)</label>
                  <input required type="number" className="acc-input" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
              </div>

              {/* SELECT DINÂMICO DE CATEGORIA */}
              <div className="acc-input-group">
                <label>Categoria Principal</label>
                <select className="acc-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subcategory: ""})}>
                  <option value="">Selecione...</option>
                  {Object.keys(estruturaCategorias).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* SELECT DINÂMICO DE SUBCATEGORIA */}
              {formData.category && estruturaCategorias[formData.category] && (
                <div className="acc-input-group">
                  <label>Subcategoria</label>
                  <select className="acc-input" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})}>
                    <option value="">Selecione...</option>
                    {/* Supondo que o banco retorne um objeto onde o valor é um array ou sub-objeto */}
                    {Object.keys(estruturaCategorias[formData.category]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="acc-btn-primary w-full mt-4">
                {editingId ? "Atualizar Serviço" : "Salvar Serviço"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}