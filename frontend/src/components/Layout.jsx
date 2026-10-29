import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, ShieldCheck, LogOut } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Layout() {
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [loginOpen,   setLoginOpen]   = useState(false);
  const [headerTitle, setHeaderTitle] = useState(null); // null = padrão
  const [headerLogo,  setHeaderLogo]  = useState(null); // null = sem logo
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  function logout() {
    localStorage.clear();
    sessionStorage.removeItem('empresa');
    setDrawerOpen(false);
    navigate('/');
  }

  function openAdmin() {
    setDrawerOpen(false);
    if (token) navigate('/admin');
    else setLoginOpen(true);
  }

  const brandText = headerTitle ?? 'Cardapios Online - Sistemas';

  return (
    <div className="pub-wrap">
      {/* ── Fixed Header ── */}
      <header className="pub-header">
       
<div
  className="pub-brand"
  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
>
  {headerLogo && (
    <img
      src={headerLogo}
      alt="Logo"
      style={{
        height: 38,
        width: 38,
        objectFit: 'cover',
        borderRadius: 8,
        border: '2px solid rgba(255,255,255,0.25)',
        flexShrink: 0
      }}
    />
  )}
  <span>{brandText}</span>
</div>

          <span>{brandText}</span>
       

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {headerLogo && (
                  <img
                    src={headerLogo}
                    alt="Logo"
                    style={{
                      height: 32,
                      width: 32,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '2px solid rgba(255,255,255,0.25)',
                      flexShrink: 0
                    }}
                  />
                )}
                <span className="drawer-brand">{brandText}</span>
              </div>
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
        <Outlet context={{ setHeaderTitle, setHeaderLogo }} />
      </main>

      {/* ── Fixed Footer ── */}
      <footer className="pub-footer">
        © {new Date().getFullYear()} Cardapíos Online — Todos os direitos reservados
      </footer>

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setLoginOpen(false); navigate('/admin'); }}
        />
      )}
    </div>
  );
}
