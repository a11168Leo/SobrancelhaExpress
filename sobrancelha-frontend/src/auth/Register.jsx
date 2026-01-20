import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "./authService";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao registrar");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>Cadastro</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />
        <select value={role} onChange={e => setRole(e.target.value)} style={{ marginBottom: "1rem" }}>
          <option value="client">Cliente</option>
          <option value="professional">Profissional</option>
        </select>
        <button type="submit" style={{ width: "100%" }}>Registrar</button>
      </form>
      <p>
        Já tem conta? <a href="/login">Entre</a>
      </p>
    </div>
  );
}
