import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Package,
  LogOut, Home, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user          = JSON.parse(localStorage.getItem('user') || '{}');
  const sessionEmpresa = JSON.parse(sessionStorage.getItem('empresa') || 'null');
  const isAdmin       = user.type === 'ADMIN';

  // Alias da empresa do USER: prefer sessionStorage, fallback ao login
  const empresaAlias = sessionEmpresa?.alias || (user.type === 'USER' ? user.login : null);

  function logout() {
    localStorage.clear();
    sessionStorage.removeItem('empresa');
    navigate('/');
  }

  return (
    <div className="admin-wrap">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-top">
          <span className="sidebar-logo">{isAdmin ? 'ADMIN' : 'PAINEL'}</span>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expandir' : 'Recolher'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="sidebar-user">
          <strong>{user.login || 'Usuário'}</strong>
          <span>{user.type}</span>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard — só ADMIN */}
          {isAdmin && (
            <NavLink to="/admin" end>
              <LayoutDashboard size={18} />
              <span className="nav-label">Dashboard</span>
            </NavLink>
          )}

          <div className="sidebar-section">Cadastros</div>

          {/* Usuários e Empresas — só ADMIN */}
          {isAdmin && (
            <>
              <NavLink to="/admin/usuarios">
                <Users size={18} />
                <span className="nav-label">Usuários</span>
              </NavLink>
              <NavLink to="/admin/empresas">
                <Building2 size={18} />
                <span className="nav-label">Empresas</span>
              </NavLink>
            </>
          )}

          {/* Produtos — todos */}
          <NavLink to="/admin/produtos">
            <Package size={18} />
            <span className="nav-label">Produtos</span>
          </NavLink>

          <div className="sidebar-section">Sistema</div>

          <NavLink to="/">
            <Home size={18} />
            <span className="nav-label">Página inicial</span>
          </NavLink>

          {/* Ir para página da empresa — só USER */}
          {!isAdmin && empresaAlias && (
            <NavLink to={`/${empresaAlias}`}>
              <ExternalLink size={18} />
              <span className="nav-label">Ver cardápio</span>
            </NavLink>
          )}
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
          <span className="admin-topbar-title">
            {isAdmin ? 'Painel Administrativo' : 'Gerenciamento de Produtos'}
          </span>
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
