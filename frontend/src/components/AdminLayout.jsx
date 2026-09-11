import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Package,
  LogOut, Home, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="admin-wrap">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-top">
          <span className="sidebar-logo">ADMIN</span>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expandir' : 'Recolher'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="sidebar-user">
          <strong>{user.login || 'Administrador'}</strong>
          <span>{user.type || user.usertype}</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end>
            <LayoutDashboard size={18} />
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <div className="sidebar-section">Cadastros</div>

          <NavLink to="/admin/usuarios">
            <Users size={18} />
            <span className="nav-label">Usuários</span>
          </NavLink>

          <NavLink to="/admin/empresas">
            <Building2 size={18} />
            <span className="nav-label">Empresas</span>
          </NavLink>

          <NavLink to="/admin/produtos">
            <Package size={18} />
            <span className="nav-label">Produtos</span>
          </NavLink>

          <div className="sidebar-section">Sistema</div>

          <NavLink to="/">
            <Home size={18} />
            <span className="nav-label">Página inicial</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <LogOut size={18} />
            <span className="nav-label">Sair</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`admin-main${collapsed ? ' collapsed' : ''}`}>
        <header className="admin-topbar">
          <span className="admin-topbar-title">Painel Administrativo</span>
          <div className="admin-topbar-right">
            <span className="admin-user-badge">{user.login}</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
