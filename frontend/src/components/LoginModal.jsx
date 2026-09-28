import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function LoginModal({ onClose, onSuccess }) {
  const [form, setForm]   = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Armazena dados da empresa na sessão (apenas para USER)
      if (data.empresa) {
        sessionStorage.setItem('empresa', JSON.stringify(data.empresa));
      } else {
        sessionStorage.removeItem('empresa');
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-header">
          <span />
          <button onClick={onClose}>×</button>
        </div>

        <div className="login-card">
          <ShieldCheck size={40} />
          <h2>Acesso administrativo</h2>
          <p>Entre com suas credenciais para continuar.</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Login</label>
              <input
                autoFocus
                value={form.login}
                onChange={e => setForm({ ...form, login: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <span className="login-hint">Primeiro acesso: admin / admin123</span>
        </div>
      </div>
    </div>
  );
}
