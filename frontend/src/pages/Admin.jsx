import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Building2, BarChart3, ChevronDown, Check } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

export default function Admin() {
  const [stats, setStats]       = useState(null);
  const [relatorio, setRelatorio] = useState([]);
  const [selected, setSelected]   = useState([]);   // IDs selecionados
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.type === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/clientes/dashboard').then(({ data }) => setStats(data));
    api.get('/clientes/relatorio-produtos').then(({ data }) => {
      setRelatorio(data);
      setSelected(data.map(c => c.id)); // seleciona todos por padrão
    });
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggleId(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(relatorio.map(c => c.id));
  }
  function deselectAll() {
    setSelected([]);
  }

  // USER não deve chegar aqui — PrivateRoute já redireciona,
  // mas mantemos como segurança adicional
  if (!isAdmin) return <Navigate to="/admin/produtos" replace />;

  // Dados filtrados para o gráfico
  const chartData = relatorio
    .filter(c => selected.includes(c.id))
    .map(c => ({
      nome: c.alias || c.nome_completo,
      nome_completo: c.nome_completo,
      produtos: c.total_produtos
    }));

  const selectedCount = selected.length;
  const totalEmpresas = relatorio.length;

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">ADMINISTRATIVO</p>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, 280px)' }}>
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

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Building2 size={22} />
          </div>
          <div className="stat-info">
            <span>Empresas cadastradas</span>
            <strong>{stats?.clientes ?? '—'}</strong>
            <small>{stats?.clientesAtivos ?? 0} ativas</small>
          </div>
        </div>
      </div>

      {/* Gráfico de barras — Produtos por Empresa */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <BarChart3 size={18} />
            <h2>Produtos por Empresa</h2>
          </div>

          {/* Multi-seletor de empresas */}
          <div className="chart-multiselect" ref={dropdownRef}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setDropdownOpen(v => !v)}
            >
              {selectedCount === totalEmpresas
                ? 'Todas as empresas'
                : selectedCount === 0
                  ? 'Nenhuma selecionada'
                  : `${selectedCount} selecionada(s)`}
              <ChevronDown size={14} />
            </button>

            {dropdownOpen && (
              <div className="chart-dropdown">
                <div className="chart-dropdown-actions">
                  <button className="chart-dropdown-link" onClick={selectAll}>Selecionar todas</button>
                  <button className="chart-dropdown-link" onClick={deselectAll}>Limpar</button>
                </div>
                <div className="chart-dropdown-list">
                  {relatorio.map(c => (
                    <label key={c.id} className="chart-dropdown-item">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={() => toggleId(c.id)}
                      />
                      <span>{c.nome_completo}</span>
                      {selected.includes(c.id) && <Check size={14} />}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="nome"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={chartData.length > 5 ? -25 : 0}
                textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                height={chartData.length > 5 ? 70 : 30}
              />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} produtos`, 'Total']}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.nome_completo || label
                }
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar
                dataKey="produtos"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">
            <BarChart3 size={40} />
            <p>Selecione ao menos uma empresa para visualizar o gráfico.</p>
          </div>
        )}
      </div>
    </section>
  );
}
