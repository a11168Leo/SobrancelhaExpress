import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "./authService";
import "./AuthPage.css";

// IMPORTAÇÃO DAS IMAGENS (Isso resolve o problema do caminho e caracteres especiais)
import fotoLogin from "../assets/WhatsApp Image 2025-11-06 at 11.20.35 (1).jpeg";
import fotoRegistro from "../assets/WhatsApp Image 2025-11-06 at 11.20.35 (2).jpeg";

export default function AuthPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

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
      setIsRightPanelActive(false);
      alert("Conta criada com sucesso! Faça login.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="auth-body">
      <div className={`container ${isRightPanelActive ? "right-panel-active" : ""}`} id="container">
        
        {/* Formulário de Registro (Sign Up) */}
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
            <button className="btn-auth" type="submit">Cadastrar</button>
          </form>
        </div>

        {/* Formulário de Login (Sign In) */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            {error && <p className="error-msg">{error}</p>}
            <input type="email" placeholder="E-mail" onChange={e => setLoginData({...loginData, email: e.target.value})} required />
            <input type="password" placeholder="Senha" onChange={e => setLoginData({...loginData, password: e.target.value})} required />
            <span className="forgot-password">Esqueceu a senha?</span>
            <button className="btn-auth" type="submit">Entrar</button>
          </form>
        </div>

        {/* Overlay Deslizante com as Fotos */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* Lado que aparece quando vai criar conta */}
            <div 
              className="overlay-panel overlay-left" 
              style={{ backgroundImage: `url(${fotoRegistro})` }}
            >
              <div className="overlay-tint">
                <h1>Já tem conta?</h1>
                <p>Clique abaixo para entrar com seus dados.</p>
                <button className="ghost" onClick={() => setIsRightPanelActive(false)}>Ir para Login</button>
              </div>
            </div>

            {/* Lado que aparece no Login inicial */}
            <div 
              className="overlay-panel overlay-right" 
              style={{ backgroundImage: `url(${fotoLogin})` }}
            >
              <div className="overlay-tint">
                <h1>Olá, Bem-vinda(o)!</h1>
                <p>Ainda não tem cadastro? Crie sua conta agora.</p>
                <button className="ghost" onClick={() => setIsRightPanelActive(true)}>Criar Conta</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}