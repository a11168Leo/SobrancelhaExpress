import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';  // Seu axios configurado para http://localhost:5000/api
import { Mail, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);  // Toggle entre login/register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response;
      if (isRegister) {
        // Registro como client
        response = await api.post('/auth/register', { name, email, password, phone });
      } else {
        // Login
        response = await api.post('/auth/login', { email, password });
      }
      const data = response.data;
      // Salvar dados
      localStorage.setItem('@SobrancelhaExpress:token', data.token);
      localStorage.setItem('@SobrancelhaExpress:user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        profileImage: data.profileImage
      }));
      // Redirecionar baseado na role
      if (data.role === 'admin' || data.role === 'professional') {
        navigate('/professional/dashboard');
      } else {
        navigate('/cliente/agendar');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.authBox}>
        <h1 style={styles.logoText}>Sobrancelha<span>Express</span></h1>
        <p style={styles.subtitle}>{isRegister ? 'Crie sua conta' : 'Bem-vindo de volta!'}</p>
        {error && <div style={styles.errorBanner}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <div style={styles.inputGroup}>
                <User size={20} color="#D988B3" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <Phone size={20} color="#D988B3" />
                <input
                  type="tel"
                  placeholder="Telefone"
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div style={styles.inputGroup}>
            <Mail size={20} color="#D988B3" />
            <input
              type="email"
              placeholder="E-mail"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={20} color="#D988B3" />
            <input
              type="password"
              placeholder="Senha"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Processando...' : (
              <>
                <span>{isRegister ? 'Registrar' : 'Entrar'}</span>
                {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
              </>
            )}
          </button>
        </form>
        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={styles.toggleButton}
        >
          {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFF6FB',
  },
  authBox: {
    background: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(217, 136, 179, 0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  logoText: {
    color: '#333',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '5px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#F9F9F9',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #eee'
  },
  input: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '16px'
  },
  button: {
    background: '#D988B3',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
    transition: '0.3s'
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#D988B3',
    cursor: 'pointer',
    marginTop: '20px',
    fontSize: '14px',
    textDecoration: 'underline'
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  }
};