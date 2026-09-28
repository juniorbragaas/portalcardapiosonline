import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../services/api';

export default function Admin() {
  const [stats, setStats] = useState(null);

  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.type === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/clientes/dashboard').then(({ data }) => setStats(data));
  }, []);

  // USER não deve chegar aqui — PrivateRoute já redireciona,
  // mas mantemos como segurança adicional
  if (!isAdmin) return <Navigate to="/admin/produtos" replace />;

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">ADMINISTRATIVO</p>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '280px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Package size={22} />
          </div>
          <div className="stat-info">
            <span>Produtos cadastrados</span>
            <strong>{stats?.produtos ?? '—'}</strong>
            <small>no total</small>
          </div>
        </div>
      </div>
    </section>
  );
}
