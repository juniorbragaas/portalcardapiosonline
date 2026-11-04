import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, Building2, Package, ArrowRight, Store, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import LoginModal from '../components/LoginModal';
import MapaEstabelecimentos from '../components/MapaEstabelecimentos';

const publicApi = axios.create({ baseURL: 'http://localhost:3000/api' });
const API = 'http://localhost:3000/api';

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  useEffect(() => {
    publicApi.get('/clientes/mapa/locais')
      .then(({ data }) => setClientes(data))
      .catch(() => { /* falha silenciosa — mapa não aparece */ });
  }, []);

  // Sincroniza seleção inicial com o mapa (apenas empresas com coordenadas)
  useEffect(() => {
    setSelectedIds(clientes.filter(c => c.latitude != null && c.longitude != null).map(c => c.id));
  }, [clientes]);

  // Reseta para a página 1 quando o filtro muda
  useEffect(() => {
    setPage(1);
  }, [selectedIds]);

  function handleAdmin() {
    if (token) navigate('/admin');
    else setLoginOpen(true);
  }

  // Empresas filtradas pelo mapa e que possuem cardápio (alias)
  const empresasFiltradas = clientes.filter(c =>
    selectedIds.includes(c.id) && c.alias
  );

  // Paginação — máximo 8 por página
  const PER_PAGE = 8;
  const totalPages = Math.ceil(empresasFiltradas.length / PER_PAGE);
  const paginated = empresasFiltradas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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

      {/* Mapa com todos os estabelecimentos cadastrados */}
      <div id="mapa-estabelecimentos">
        {clientes.length > 0 && (
          <MapaEstabelecimentos clientes={clientes} onSelectionChange={setSelectedIds} />
        )}
      </div>

      {/* Cards dos estabelecimentos (filtrados pelo mapa, com paginação) */}
      <section id="estabelecimentos" className="empresas-section">
        {empresasFiltradas.length > 0 ? (
          <>
            <div className="empresas-section-head">
              <h2>Estabelecimentos</h2>
              <span className="empresas-count">{empresasFiltradas.length}</span>
            </div>
            <div className="empresas-grid">
              {paginated.map(c => (
                <article key={c.id} className="empresa-card">
                  {/* Banner */}
                  <div className="empresa-card-banner-wrap">
                    <img
                      className="empresa-card-banner"
                      src={`${API}/clientes/${c.id}/banner`}
                      alt=""
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                    />
                    <div className="empresa-card-banner-placeholder" style={{ display: 'none' }}>
                      <ImageIcon size={28} />
                    </div>
                  </div>

                  {/* Corpo: logo + nome + botão */}
                  <div className="empresa-card-body">
                    <div className="empresa-card-header">
                      <div className="empresa-card-logo-wrap">
                        <img
                          className="empresa-card-logo"
                          src={`${API}/clientes/${c.id}/logo`}
                          alt=""
                          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                        />
                        <div className="empresa-card-logo-placeholder" style={{ display: 'none' }}>
                          <Store size={20} />
                        </div>
                      </div>
                      <h3 className="empresa-card-name">
                        <a href={`/${c.alias}`} target="_blank" rel="noreferrer" className="empresa-card-link">
                          {c.nome_completo}
                        </a>
                      </h3>
                    </div>

                    <Link to={`/${c.alias}`} className="empresa-card-btn">
                      Ver Cardápio <ExternalLink size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="pagination-info">Página {page} de {totalPages}</span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : clientes.length > 0 && (
          <div className="empresas-empty">
            <Store size={40} />
            <p>Nenhum estabelecimento encontrado com os filtros atuais.</p>
          </div>
        )}
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
