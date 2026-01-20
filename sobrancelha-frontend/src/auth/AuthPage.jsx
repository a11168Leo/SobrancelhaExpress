import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "./authService";
import "./AuthPage.css";

export default function AuthPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Estados dos formulários
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({ name: "", email: "", password: "", role: "client" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(loginData.email, loginData.password);
      data.role === "professional" ? navigate("/professional/dashboard") : navigate("/client/home");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou senha incorretos");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(regData.name, regData.email, regData.password, regData.role);
      setIsRightPanelActive(false); // Volta para o login
      alert("Conta criada com sucesso! Faça login.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="auth-body">
      <div className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}>
        
        {/* Painel de Registro */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>Criar Conta</h1>
            <input type="text" placeholder="Nome completo" onChange={e => setRegData({...regData, name: e.target.value})} required />
            <input type="email" placeholder="E-mail" onChange={e => setRegData({...regData, email: e.target.value})} required />
            <input type="password" placeholder="Senha" onChange={e => setRegData({...regData, password: e.target.value})} required />
            <select onChange={e => setRegData({...regData, role: e.target.value})}>
              <option value="client">Sou Cliente</option>
              <option value="professional">Sou Profissional</option>
            </select>
            <button className="btn-primary" type="submit">Cadastrar</button>
          </form>
        </div>

        {/* Painel de Login */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <input type="email" placeholder="E-mail" onChange={e => setLoginData({...loginData, email: e.target.value})} required />
            <input type="password" placeholder="Senha" onChange={e => setLoginData({...loginData, password: e.target.value})} required />
            <button className="btn-primary" type="submit">Entrar</button>
          </form>
        </div>

        {/* Overlay Deslizante */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* Texto que aparece quando o slide vai para a direita */}
            <div className="overlay-panel overlay-left">
              <img src="/logo-sobrancelha.png" className="floating-logo" alt="logo" />
              <h1>Bem-vinda!</h1>
              <p>Já possui uma conta? Entre agora mesmo para agendar seu horário.</p>
              <button className="btn-primary ghost" onClick={() => setIsRightPanelActive(false)}>Ir para Login</button>
            </div>

            {/* Texto que aparece no estado inicial */}
            <div className="overlay-panel overlay-right">
              <img src="/logo-sobrancelha.png" className="floating-logo" alt="logo" />
              <h1>Olá, Bem-vinda(o)!</h1>
              <p>Ainda não tem cadastro? Crie sua conta e conheça nossos serviços.</p>
              <button className="btn-primary ghost" onClick={() => setIsRightPanelActive(true)}>Criar Conta</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}