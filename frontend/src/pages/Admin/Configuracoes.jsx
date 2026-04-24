/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CONFIGURACOES.JSX */
/* ======================================== */

// Importacoes
import '../../styles/pages/Profissional/Configuracoes.css'

// Funcao: Configuracoes
function Configuracoes({ darkMode, setDarkMode }) {

  // Manipuladores de eventos
  const handleThemeChange = () => {
    setDarkMode((prev) => !prev)
  }

  // Renderizacao principal
  return (
    <section className="settings-page" aria-label="Configurações">
      <div className="settings-hero">
        <div>
          <span className="settings-eyebrow">Preferências do sistema</span>
          <h1>Configurações</h1>
          <p>
            Personalize a experiência do profissional e ajuste a aparência do painel
            de forma simples.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <article className="settings-card settings-card-highlight">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Aparência</span>
              <h2>Modo escuro</h2>
            </div>
            <span className={`settings-theme-badge ${darkMode ? 'is-dark' : 'is-light'}`}>
              {darkMode ? 'Ativo' : 'Desligado'}
            </span>
          </div>

          <p className="settings-card-description">
            Use a barra abaixo para alternar entre o visual claro e o visual escuro
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
                  : 'Visual leve para uso diário e espaços bem iluminados.'}
              </small>
            </span>
          </label>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">Organização</span>
              <h2>Dicas rápidas</h2>
            </div>
          </div>

          <ul className="settings-list">
            <li>Abra o Calendário para acompanhar eventos e agendamentos em tempo real.</li>
            <li>Use "Gerir Equipa" para atualizar profissionais, serviços e locais de atendimento.</li>
            <li>O tema escolhido fica guardado automaticamente para a próxima visita.</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

// Exportacao principal
export default Configuracoes
