import { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Search, UtensilsCrossed, Image as ImageIcon, MapPin, Mail, Phone, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';

const publicApi = axios.create({ baseURL: 'http://localhost:3000/api' });

/* Formata o código do produto com máscara numérica 00000 */
function codProduto(id) {
  return String(id).padStart(5, '0');
}

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
        <h2>
          <span className="product-card-code">#{codProduto(produto.id)}</span>
          {produto.nome_produto}
        </h2>
        {produto.categoria && <span className="product-card-cat" style={{ marginBottom: 12 }}>{produto.categoria}</span>}
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
  const [search,         setSearch]         = useState('');
  const [filterCat,      setFilterCat]      = useState('');
  const [loading,        setLoading]        = useState(true);
  const [notFound,       setNotFound]       = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    publicApi.get(`/cardapio/${alias}`)
      .then(({ data }) => {
        setEmpresa(data.empresa);
        setProducts(data.products);
        // Título usa nome_completo (não alias)
        const titulo = `Cardapios Online - ${data.empresa.nome_completo}`;
        setHeaderTitle(titulo);
        setHeaderLogo(data.empresa.logo || null);
        document.title = titulo;
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));

    return () => {
      setHeaderTitle(null);
      setHeaderLogo(null);
      document.title = 'Portal Administrativo';
    };
  }, [alias]);

  // Categorias únicas dos produtos (sem vazias)
  const categorias = [...new Set(products.map(p => p.categoria).filter(Boolean))].sort();

  const filtered = products.filter(p => {
    const matchSearch = `${p.nome_produto} ${p.descricao || ''} ${p.categoria || ''} ${codProduto(p.id)}`.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat ? p.categoria === filterCat : true;
    return matchSearch && matchCat;
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
        <div className="cardapio-search">
          <Search size={16} />
          <input
            placeholder="Pesquisar por nome ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Pesquisar produtos"
          />
        </div>
        <span className="cardapio-count">
          {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Filtro de categorias */}
      {categorias.length > 0 && (
        <div className="cardapio-cats">
          <button
            className={`cat-chip ${filterCat === '' ? 'cat-chip-active' : ''}`}
            onClick={() => setFilterCat('')}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              className={`cat-chip ${filterCat === cat ? 'cat-chip-active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de produtos */}
      <div className="cardapio-grid">
        {filtered.length === 0 ? (
          <div className="cardapio-empty">
            <UtensilsCrossed size={40} />
            <p>
              {search || filterCat
                ? 'Nenhum item encontrado para os filtros selecionados.'
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
                <h3>
                  <span className="product-card-code">#{codProduto(p.id)}</span>
                  {p.nome_produto}
                </h3>
                {p.categoria && <span className="product-card-cat">{p.categoria}</span>}
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
