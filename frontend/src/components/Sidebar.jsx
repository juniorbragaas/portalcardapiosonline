import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, Home } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Opções</div>
      <div className="sidebar-user">
        <strong>{user.login || 'Administrador'}</strong>
        <span>{user.usertype}</span>
      </div>

      <nav className="side-nav">
        <NavLink to="/admin"><LayoutDashboard size={18}/> Dashboard</NavLink>
        <NavLink to="/admin/usuarios"><Users size={18}/> Usuários</NavLink>
        <NavLink to="/admin/clientes"><Building2 size={18}/> Clientes</NavLink>
        <NavLink to="/"><Home size={18}/> Página inicial</NavLink>
      </nav>

      <button className="side-logout" onClick={logout}>
        <LogOut size={18}/> Sair
      </button>
    </aside>
  );
}
