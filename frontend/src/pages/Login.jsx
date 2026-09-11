import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao autenticar');
    }
  }

  return (
    <div className="auth-box">
      <ShieldCheck size={36}/>
      <h1>Acesso administrativo</h1>
      <p>Entre para gerenciar usuários e clientes.</p>
      <form onSubmit={submit}>
        <label>Login</label>
        <input autoFocus value={form.login} onChange={e=>setForm({...form,login:e.target.value})}/>
        <label>Senha</label>
        <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        {error && <div className="error">{error}</div>}
        <button className="primary full">Entrar</button>
      </form>
      <small>Primeiro acesso: admin / admin123</small>
    </div>
  );
}
