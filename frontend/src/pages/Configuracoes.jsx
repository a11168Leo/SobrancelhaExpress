/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CONFIGURACOES.JSX */
/* ======================================== */

// Importacoes
import '../styles/pages/Configuracoes.css'

// Funcao: Configuracoes
function Configuracoes({ darkMode, setDarkMode }) {

// Manipuladores de eventos
  const handleThemeChange = () => {
    setDarkMode((prev) => !prev)
  }

// Renderizacao principal
  return (
    <section className="settings-page" aria-label="Configuracoes">
      <div className="settings-hero">
        <div>
          <span className="settings-eyebrow">Preferencias do sistema</span>
          <h1>Configuracoes</h1>
          <p>
            Personalize a experiencia do profissional e ajuste a aparencia do painel
            de forma simples.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <article className="settings-card settings-card-highlight">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Aparencia</span>
              <h2>Modo escuro</h2>
            </div>
            <span className={`settings-theme-badge ${darkMode ? 'is-dark' : 'is-light'}`}>
              {darkMode ? 'Ativo' : 'Desligado'}
            </span>
          </div>

          <p className="settings-card-description">
            Use a barrinha abaixo para alternar entre o visual claro e o visual escuro
            em todo o sistema.
          </p>

          <label className="theme-switch" htmlFor="dark-mode-toggle">
            <input
              id="dark-mode-toggle"
              type="checkbox"
              checked={darkMode}
              onChange={handleThemeChange}
            />
            <span className="theme-switch-track">
              <span className="theme-switch-thumb"></span>
            </span>
            <span className="theme-switch-copy">
              <strong>{darkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}</strong>
              <small>
                {darkMode
                  ? 'Ideal para ambientes com pouca luz e uso noturno.'
                  : 'Visual leve para uso diario e espacos bem iluminados.'}
              </small>
            </span>
          </label>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Organizacao</span>
              <h2>Dicas rapidas</h2>
            </div>
          </div>

          <ul className="settings-list">
            <li>Abra o Calendario para acompanhar eventos e agendamentos em tempo real.</li>
            <li>Use Gerir Equipe para atualizar profissionais, servicos e locais de atendimento.</li>
            <li>O tema escolhido fica guardado automaticamente para a proxima visita.</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

// Exportacao principal
export default Configuracoes
