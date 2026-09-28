import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const token    = localStorage.getItem('token');
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!token) return <Navigate to="/" replace />;

  // USER acessando /admin (dashboard) → redireciona para produtos
  if (user.type === 'USER' && location.pathname === '/admin') {
    return <Navigate to="/admin/produtos" replace />;
  }

  return <Outlet />;
}
