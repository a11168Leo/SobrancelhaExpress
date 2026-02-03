import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import api from '../../api/api';
import '../../styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('@SobrancelhaExpress:token', data.token);
      localStorage.setItem('@SobrancelhaExpress:user', JSON.stringify(data.user));

      navigate('/professional/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleLogin}>
        <h2>Sobrancelha Express</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="auth-input-group">
          <Mail />
          <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="auth-input-group">
          <Lock />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-button">Entrar</button>
      </form>
    </div>
  );
}
