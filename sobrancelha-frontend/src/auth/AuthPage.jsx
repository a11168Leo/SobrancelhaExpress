import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "./authService";
import "./AuthPage.css";
import fotoLogin from "../assets/interior1.jpeg";
import fotoRegistro from "../assets/interior2.jpeg";

export default function AuthPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  
  // REGISTRO - somente clientes
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(regData.name, regData.email, regData.password, "client"); // força role client
      setIsRightPanelActive(false);
      alert("Conta criada com sucesso! Faça login.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    }
  };
  
  
    // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(loginData.email, loginData.password);

      if (data.role === "client") navigate("/client/home");
      else if (data.role === "professional")
        navigate("/professional/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou senha incorretos");
    }
  };

  return (
    <div className="auth-body">
      <div
        className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}
        id="container"
      >
        {/* FORMULÁRIO DE REGISTRO */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>Criar Conta</h1>
            <input
              type="text"
              placeholder="Nome completo"
              onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="E-mail"
              onChange={(e) =>
                setRegData({ ...regData, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Senha"
              onChange={(e) =>
                setRegData({ ...regData, password: e.target.value })
              }
              required
            />
            {/* Remove select de role, sempre será "client" */}
            <button className="btn-auth" type="submit">
              Cadastrar
            </button>
          </form>
        </div>

        {/* FORMULÁRIO DE LOGIN */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            {error && <p className="error-msg">{error}</p>}
            <input
              type="email"
              placeholder="E-mail"
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Senha"
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
            />
            <span className="forgot-password">Esqueceu a senha?</span>
            <button className="btn-auth" type="submit">
              Entrar
            </button>
          </form>
        </div>

        {/* OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            <div
              className="overlay-panel overlay-left"
              style={{ backgroundImage: `url(${fotoRegistro})` }}
            >
              <div className="overlay-tint">
                <h1>Já tem conta?</h1>
                <p>Clique abaixo para entrar com seus dados.</p>
                <button
                  className="ghost"
                  onClick={() => setIsRightPanelActive(false)}
                >
                  Ir para Login
                </button>
              </div>
            </div>

            <div
              className="overlay-panel overlay-right"
              style={{ backgroundImage: `url(${fotoLogin})` }}
            >
              <div className="overlay-tint">
                <h1>Olá, Bem-vinda(o)!</h1>
                <p>Ainda não tem cadastro? Crie sua conta agora.</p>
                <button
                  className="ghost"
                  onClick={() => setIsRightPanelActive(true)}
                >
                  Criar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
