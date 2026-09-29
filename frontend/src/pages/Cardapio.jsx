import { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Search, UtensilsCrossed, Image as ImageIcon, MapPin, Mail, Phone, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';

const publicApi = axios.create({ baseURL: 'http://localhost:3000/api' });

/* ── Modal de detalhe do produto — ocupa a página inteira ───── */
function ProdutoModal({ produto, onClose }) {
  useEffect(() => {
    // Trava scroll do body enquanto o modal está aberto
    document.body.style.overflow = 'hidden';
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="produto-fullpage" role="dialog" aria-modal="true" aria-label={produto.nome_produto}>

      {/* Botão fechar — fixo no canto */}
      <button className="produto-fullpage-close" onClick={onClose} aria-label="Fechar">
        <X size={20} />
      </button>

      {/* Foto (ou placeholder) */}
      {produto.foto_produto ? (
        <img
          className="produto-fullpage-img"
          src={produto.foto_produto}
          alt={produto.nome_produto}
        />
      ) : (
        <div className="produto-fullpage-placeholder">
          <UtensilsCrossed size={64} />
        </div>
      )}

      {/* Conteúdo */}
      <div className="produto-fullpage-body">
        <h2>{String(produto.id).padStart(4, '0')} — {produto.nome_produto}</h2>
        {produto.descricao && <p>{produto.descricao}</p>}
        <span className="produto-fullpage-price">
          {produto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────── */
export default function Cardapio() {
  const { alias } = useParams();
  const { setHeaderTitle, setHeaderLogo } = useOutletContext();
  const [empresa,        setEmpresa]        = useState(null);
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const MAX_VISIBLE = 6;
  const [search,         setSearch]         = useState('');
  const [loading,        setLoading]        = useState(true);
  const [notFound,       setNotFound]       = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    function check() {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight;
      setIsScrollable(scrollable);
      setShowTop(scrollable && window.scrollY > 200);
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    publicApi.get(`/cardapio/${alias}`)
      .then(({ data }) => {
        setEmpresa(data.empresa);
        setProducts(data.products);
        // Prepara lista de categorias a partir dos produtos (únicos, ordenados)
        const cats = Array.from(new Map(data.products
          .filter(p => p.categoria)
          .map(p => [String(p.categoria.id), p.categoria])
        ).values());
        setCategories(cats);

        // Título usa nome_completo (não alias)
        const titulo = `Cardapios Online - ${data.empresa.nome_completo}`;
        setHeaderTitle(titulo);
        setHeaderLogo(data.empresa.logo || null);
        // O cabeçalho não deve ser clicável nesta página
        if (typeof setHeaderClickable === 'function') setHeaderClickable(false);
        document.title = titulo;
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));

    return () => {
      setHeaderTitle(null);
      setHeaderLogo(null);
      // Restaura clique padrão ao sair da página
      if (typeof setHeaderClickable === 'function') setHeaderClickable(true);
      document.title = 'Portal Administrativo';
    };
  }, [alias]);

  // Ordena por rank (peso) desc, id asc antes de filtrar
  const sorted = [...products].sort((a, b) => {
    const ra = a.rank ?? 0;
    const rb = b.rank ?? 0;
    if (ra !== rb) return rb - ra; // maior rank primeiro
    return (a.id || 0) - (b.id || 0); // id crescente
  });

  const filtered = sorted.filter(p => {
    const q = search.trim().toLowerCase();
    const text = `${p.nome_produto} ${p.descricao || ''}`.toLowerCase();
    const matchesText = q ? text.includes(q) : true;
    const idStr = String(p.id);
    const matchesId = q ? (idStr.includes(q) || idStr.padStart(4, '0').includes(q)) : false;
    const matchesCategory = categoryFilter ? String(p.id_categoria) === String(categoryFilter) : true;
    return (matchesText || matchesId) && matchesCategory;
  });

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="cardapio-loading">
        <UtensilsCrossed size={40} style={{ marginBottom: 12, color: '#d1d5db' }} />
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !empresa) {
    return (
      <div className="cardapio-loading">
        <UtensilsCrossed size={40} style={{ marginBottom: 12, color: '#d1d5db' }} />
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Empresa não encontrada</p>
        <p style={{ color: '#9ca3af', marginBottom: 24 }}>
          O cardápio "<strong>{alias}</strong>" não existe ou foi removido.
        </p>
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={16} /> Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Banner */}
      {empresa.banner ? (
        <img className="cardapio-banner" src={empresa.banner} alt={`Banner ${empresa.nome_completo}`} />
      ) : (
        <div className="cardapio-banner-placeholder">
          <UtensilsCrossed size={48} />
        </div>
      )}

      {/* Hero: logo + info */}
      <div className="cardapio-hero">
        {empresa.logo ? (
          <img className="cardapio-logo" src={empresa.logo} alt={`Logo ${empresa.nome_completo}`} />
        ) : (
          <div className="cardapio-logo-placeholder">
            <ImageIcon size={32} />
          </div>
        )}
        <div className="cardapio-info">
          <h2>{empresa.nome_completo}</h2>
          <p>
            {empresa.descricao && (
              <span style={{ display: 'block', marginBottom: 4 }}>{empresa.descricao}</span>
            )}
            {empresa.endereco && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
                <MapPin size={13} /> {empresa.endereco}
              </span>
            )}
            {empresa.email && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
                <Mail size={13} /> {empresa.email}
              </span>
            )}
            {empresa.celular && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Phone size={13} /> {empresa.celular}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar de pesquisa */}
      <div className="cardapio-toolbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="cardapio-search">
            <Search size={16} />
            <input
              placeholder="Pesquisar no cardápio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Pesquisar produtos"
            />
          </div>

          {/* Botões de filtro por categoria */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              style={{
                padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb',
                background: categoryFilter === '' ? '#111827' : '#fff',
                color: categoryFilter === '' ? '#fff' : '#111827', cursor: 'pointer'
              }}
            >
              Todas as categorias
            </button>

            {categories.slice(0, showAllCategories ? categories.length : MAX_VISIBLE).map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryFilter(String(c.id))}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb',
                  background: String(categoryFilter) === String(c.id) ? '#111827' : '#fff',
                  color: String(categoryFilter) === String(c.id) ? '#fff' : '#111827', cursor: 'pointer'
                }}
              >
                {c.nome}
              </button>
            ))}

            {categories.length > MAX_VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAllCategories(v => !v)}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px dashed #9ca3af',
                  background: '#fff', color: '#111827', cursor: 'pointer'
                }}
              >
                {showAllCategories ? 'Mostrar menos' : `Mais (${categories.length - MAX_VISIBLE})`}
              </button>
            )}
          </div>
        </div>

        <span className="cardapio-count">
          {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Grid de produtos */}
      <div className="cardapio-grid">

      {/* Footer fixo com botão voltar ao topo (sempre presente) */}
      <footer style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, height: 56,
        background: '#fafafa', display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', padding: '0 20px', boxShadow: '0 -4px 8px rgba(0,0,0,0.04)', zIndex: 80
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Voltar ao topo"
          disabled={!isScrollable}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid #eaeef2',
            background: '#ffffff', color: '#6b7280', cursor: isScrollable ? 'pointer' : 'default',
            opacity: isScrollable ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <ArrowLeft style={{ transform: 'rotate(180deg)' }} />
          <span style={{ fontSize: 13 }}>Topo</span>
        </button>
      </footer>
        {filtered.length === 0 ? (
          <div className="cardapio-empty">
            <UtensilsCrossed size={40} />
            <p>
              {search
                ? `Nenhum item encontrado para "${search}".`
                : 'Nenhum produto cadastrado neste cardápio ainda.'}
            </p>
          </div>
        ) : (
          filtered.map(p => (
            <article
              key={p.id}
              className="product-card"
              onClick={() => setProdutoSelecionado(p)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalhes de ${p.nome_produto}`}
              onKeyDown={e => e.key === 'Enter' && setProdutoSelecionado(p)}
            >
              {p.foto_produto ? (
                <img className="product-card-img" src={p.foto_produto} alt={p.nome_produto} />
              ) : (
                <div className="product-card-img-placeholder">
                  <UtensilsCrossed size={36} />
                </div>
              )}
              <div className="product-card-body">
                <h3>{String(p.id).padStart(4, '0')} — {p.nome_produto}</h3>
                {p.descricao && <p>{p.descricao}</p>}
                <span className="product-card-price">
                  {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal de detalhe */}
      {produtoSelecionado && (
        <ProdutoModal
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
        />
      )}
    </>
  );
}
