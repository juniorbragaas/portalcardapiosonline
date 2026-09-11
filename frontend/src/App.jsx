import { Routes, Route, Navigate } from 'react-router-dom';
import Layout      from './components/Layout';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

import Home     from './pages/Home';
import Admin    from './pages/Admin';
import Users    from './pages/Users';
import Clients  from './pages/Clients';
import Products from './pages/Products';

export default function App() {
  return (
    <Routes>
      {/* ── Rotas públicas (com header/footer/menu) ── */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* ── Rotas protegidas (admin) ── */}
        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"           element={<Admin />} />
            <Route path="/admin/usuarios"  element={<Users />} />
            <Route path="/admin/empresas"  element={<Clients />} />
            <Route path="/admin/produtos"  element={<Products />} />
          </Route>
        </Route>
      </Route>

      {/* Redireciona rotas desconhecidas para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
