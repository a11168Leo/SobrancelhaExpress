import React, { useState, useEffect } from 'react';
import { User, Shield, LogOut, Camera, ChevronLeft, Save, X, Plus, Sparkles } from 'lucide-react';

export default function Account() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [loading, setLoading] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState("");
  const [user, setUser] = useState({
    nome: "",
    email: "",
    foto: null,
    especialidades: []
  });

  const API_URL = 'http://localhost:5000/api/profile'; // Ajuste para sua rota real

  // 1. CARREGAR DADOS DA BASE DE DATOS
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setUser({
          nome: data.nome || "Profissional",
          email: data.email || "",
          foto: data.foto || null,
          especialidades: data.especialidades || []
        });
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };
    fetchUserData();
  }, []);

  // 2. SALVAR PERFIL (NOME, EMAIL, FOTO)
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (response.ok) {
        alert("Dados salvos com sucesso! ✨");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 3. LÓGICA DE FOTO
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. GESTÃO DE ESPECIALIDADES
  const addEspecialidade = (e) => {
    e.preventDefault();
    if (novaEspecialidade.trim() && !user.especialidades.includes(novaEspecialidade)) {
      const atualizado = [...user.especialidades, novaEspecialidade.trim()];
      setUser({ ...user, especialidades: atualizado });
      setNovaEspecialidade("");
    }
  };

  const removeEspecialidade = (indexToRemove) => {
    const filtrado = user.especialidades.filter((_, index) => index !== indexToRemove);
    setUser({ ...user, especialidades: filtrado });
  };

  return (
    <div className="acc-container">
      <h1 className="acc-main-title">Minha Conta</h1>
      
      <div className="acc-profile-card">
        
        {/* TELA: MENU PRINCIPAL */}
        {activeTab === 'menu' && (
          <div className="acc-fade-in">
            <div className="acc-header-section">
              <div className="acc-avatar-display">
                {user.foto ? (
                  <img src={user.foto} className="acc-img-full" alt="Perfil" />
                ) : (
                  <span className="acc-initials">{user.nome ? user.nome.charAt(0) : "P"}</span>
                )}
              </div>
              <div>
                <h2 className="acc-user-name">{user.nome || "Carregando..."}</h2>
                <div className="acc-tag-container-mini">
                  {user.especialidades.slice(0, 3).map((esp, i) => (
                    <span key={i} className="acc-mini-tag">{esp}</span>
                  ))}
                  {user.especialidades.length > 3 && <span className="acc-mini-tag">+{user.especialidades.length - 3}</span>}
                </div>
              </div>
            </div>

            <div className="acc-options-list">
              <button onClick={() => setActiveTab('perfil')} className="acc-option-item">
                <div className="acc-option-info">
                  <div className="acc-icon-box blue"><User size={20}/></div>
                  <div>
                    <p className="acc-label">Editar Perfil</p>
                    <p className="acc-desc">Nome, e-mail e foto</p>
                  </div>
                </div>
                <span className="acc-arrow">→</span>
              </button>

              <button onClick={() => setActiveTab('especialidades')} className="acc-option-item">
                <div className="acc-option-info">
                  <div className="acc-icon-box pink"><Sparkles size={20}/></div>
                  <div>
                    <p className="acc-label">Minhas Especialidades</p>
                    <p className="acc-desc">Gerencie suas habilidades</p>
                  </div>
                </div>
                <span className="acc-arrow">→</span>
              </button>

              <button onClick={() => setActiveTab('seguranca')} className="acc-option-item">
                <div className="acc-option-info">
                  <div className="acc-icon-box purple"><Shield size={20}/></div>
                  <div>
                    <p className="acc-label">Segurança</p>
                    <p className="acc-desc">Alterar senha da conta</p>
                  </div>
                </div>
                <span className="acc-arrow">→</span>
              </button>

              <button className="acc-option-item logout" onClick={() => alert("Saindo...")}>
                <div className="acc-option-info">
                  <div className="acc-icon-box red"><LogOut size={20}/></div>
                  <p className="acc-label red-text">Sair da Conta</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TELA: EDITAR PERFIL */}
        {activeTab === 'perfil' && (
          <div className="acc-form-padding acc-fade-in">
            <button onClick={() => setActiveTab('menu')} className="acc-back-btn">
              <ChevronLeft size={18} /> Voltar
            </button>
            <h3 className="acc-section-title">Editar Perfil</h3>
            
            <form onSubmit={handleSaveProfile}>
              <div className="acc-avatar-upload">
                <div className="acc-avatar-relative">
                  <img 
                    src={user.foto || `https://ui-avatars.com/api/?name=${user.nome}&background=D988B3&color=fff`} 
                    className="acc-preview-img" 
                    alt="Preview" 
                  />
                  <label htmlFor="file-input" className="acc-upload-badge"><Camera size={14}/></label>
                  <input id="file-input" type="file" hidden onChange={handleFotoChange} />
                </div>
              </div>

              <div className="acc-input-group">
                <label>Nome Completo</label>
                <input type="text" className="acc-input" value={user.nome} onChange={e => setUser({...user, nome: e.target.value})} />
              </div>
              <div className="acc-input-group">
                <label>E-mail</label>
                <input type="email" className="acc-input" value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
              </div>
              <button type="submit" className="acc-btn-primary" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        )}

        {/* TELA: ESPECIALIDADES */}
        {activeTab === 'especialidades' && (
          <div className="acc-form-padding acc-fade-in">
            <button onClick={() => setActiveTab('menu')} className="acc-back-btn">
              <ChevronLeft size={18} /> Voltar
            </button>
            <h3 className="acc-section-title">Minhas Especialidades</h3>
            <p className="acc-user-sub" style={{ marginBottom: '20px' }}>Adicione as técnicas que você domina.</p>

            <form onSubmit={addEspecialidade} className="acc-input-inline">
              <input 
                type="text" 
                className="acc-input" 
                placeholder="Ex: Balayage, Barba..." 
                value={novaEspecialidade}
                onChange={(e) => setNovaEspecialidade(e.target.value)}
              />
              <button type="submit" className="acc-btn-add"><Plus size={20}/></button>
            </form>

            <div className="acc-tags-wrapper">
              {user.especialidades.map((esp, index) => (
                <div key={index} className="acc-tag-large">
                  {esp}
                  <button onClick={() => removeEspecialidade(index)} className="acc-tag-remove">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <button className="acc-btn-primary" onClick={handleSaveProfile} style={{ marginTop: '30px' }}>
              {loading ? "Gravando..." : "Salvar Especialidades"}
            </button>
          </div>
        )}

        {/* TELA: SEGURANÇA */}
        {activeTab === 'seguranca' && (
          <div className="acc-form-padding acc-fade-in">
            <button onClick={() => setActiveTab('menu')} className="acc-back-btn">
              <ChevronLeft size={18} /> Voltar
            </button>
            <h3 className="acc-section-title">Alterar Senha</h3>
            <div className="acc-input-group">
              <label>Nova Senha</label>
              <input type="password" className="acc-input" placeholder="Digite a nova senha" />
            </div>
            <button className="acc-btn-primary">Atualizar Senha</button>
          </div>
        )}

      </div>
    </div>
  );
}