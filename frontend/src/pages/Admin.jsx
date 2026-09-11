import { useEffect, useState } from 'react';
import { Users, Building2, Package, UserCheck } from 'lucide-react';
import api from '../services/api';

function StatCard({ icon, label, value, detail, color = '#eff6ff', iconColor = '#3b82f6' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-info">
        <span>{label}</span>
        <strong>{value ?? '—'}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/clientes/dashboard').then(({ data }) => setStats(data));
  }, []);

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">ADMINISTRATIVO</p>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Users size={22} />}
          label="Usuários cadastrados"
          value={stats?.usuarios}
          detail="no sistema"
        />
        <StatCard
          icon={<Building2 size={22} />}
          label="Empresas cadastradas"
          value={stats?.clientes}
          detail="no total"
          color="#f0fdf4"
          iconColor="#10b981"
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Empresas ativas"
          value={stats?.clientesAtivos}
          detail="com status ativo"
          color="#fefce8"
          iconColor="#d97706"
        />
      </div>
    </section>
  );
}
