import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, ShieldCheck, LogOut, Menu, X, Package, Building2, Users } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen]   = useState(false);
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const user      = JSON.parse(localStorage.getItem('user') || 'null');

  function logout() {
    localStorage.clear();
    setDrawerOpen(false);
    navigate('/');
  }

  function openAdmin() {
    setDrawerOpen(false);
    if (token) navigate('/admin');
    else setLoginOpen(true);
  }

  return (
    <div className="pub-wrap">
      {/* ── Fixed Header ── */}
      <header className="pub-header">
        <Link className="pub-brand" to="/">Cardapios Online - Sistemas</Link>

        <button
          className={`hamburger${drawerOpen ? ' open' : ''}`}
          onClick={() => setDrawerOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </header>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <nav className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-brand">Cardapios Online</span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>

            <div className="drawer-nav">
              <Link to="/" onClick={() => setDrawerOpen(false)}>
                <Home size={18} /> Início
              </Link>

              <button onClick={openAdmin}>
                <ShieldCheck size={18} />
                {token ? 'Ir para Admin' : 'Administrativo'}
              </button>

              {token && (
                <button onClick={logout}>
                  <LogOut size={18} /> Sair ({user?.login})
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="pub-main">
        <Outlet />
      </main>

      {/* ── Fixed Footer ── */}
      <footer className="pub-footer">
        © {new Date().getFullYear()} Cardapíos Online — Todos os direitos reservados
      </footer>

      {/* ── Login Modal ── */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setLoginOpen(false); navigate('/admin'); }}
        />
      )}
    </div>
  );
}
