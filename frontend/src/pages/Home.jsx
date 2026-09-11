import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Building2, Package, ArrowRight } from 'lucide-react';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  function handleAdmin() {
    if (token) navigate('/admin');
    else setLoginOpen(true);
  }

  return (
    <>
      <section className="hero">
        <div>
          <span className="hero-badge">PORTAL</span>
          <h1>Cardapios online Sistemas</h1>
          <p>Gerencie Cardapios de empresas</p>
          <button className="btn btn-primary" onClick={handleAdmin}>
            <ShieldCheck size={18} />
            {token ? 'Ir para o painel' : 'Acessar painel administrativo'}
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="hero-cards">
          <div className="hero-card">
            <Users size={26} />
            <h3>Usuários</h3>
            <p>Controle de acesso e permissões por tipo de usuário.</p>
          </div>
          <div className="hero-card">
            <Building2 size={26} />
            <h3>Empresas</h3>
            <p>Cadastro com logo, banner, contato e descrição.</p>
          </div>
          <div className="hero-card">
            <Package size={26} />
            <h3>Produtos</h3>
            <p>Catálogo de produtos vinculados às empresas.</p>
          </div>
          <div className="hero-card">
            <ShieldCheck size={26} />
            <h3>Seguro</h3>
            <p>Autenticação JWT com controle de sessão.</p>
          </div>
        </div>
      </section>

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setLoginOpen(false); navigate('/admin'); }}
        />
      )}
    </>
  );
}
