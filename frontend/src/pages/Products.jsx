import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const API = 'http://localhost:3000/api';

const EMPTY = {
  nome_produto: '', descricao: '', id_empresa: '', id_categoria: '', rank: '', valor: '', foto_produto: null
};

export default function Products() {
  const [products,     setProducts]     = useState([]);
  const [empresas,     setEmpresas]     = useState([]);
  const [minhaEmpresa, setMinhaEmpresa] = useState(null);
  const [categorias,   setCategorias]   = useState([]);
  const [form,         setForm]         = useState(EMPTY);
  const [editing,      setEditing]      = useState(null);
  const [search,       setSearch]       = useState('');
  const [preview,      setPreview]      = useState(null);
  const [alert,        setAlert]        = useState(null);
  const [filterEmp,    setFilterEmp]    = useState('');
  const [loadError,    setLoadError]    = useState(null);

  const currentUser    = JSON.parse(localStorage.getItem('user') || '{}');
  const isUser         = currentUser.type === 'USER';
  const myEmpresaId    = currentUser.id_empresa ?? null;
  const sessionEmpresa = JSON.parse(sessionStorage.getItem('empresa') || 'null');

  async function load() {
    setLoadError(null);
    try {
      const { data } = await api.get('/produtos');
      setProducts(data);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Erro ao carregar produtos.');
      return;
    }

    if (isUser) {
      if (sessionEmpresa) {
        setMinhaEmpresa(sessionEmpresa);
      } else {
        try {
          const { data } = await api.get('/clientes/minha-empresa');
          setMinhaEmpresa(data);
        } catch { /* mantém null */ }
      }

      // CARREGA categorias da empresa do USER
      try {
        const { data } = await api.get('/categorias');
        setCategorias(data);
      } catch { setCategorias([]); }
    } else {
      try {
        const { data } = await api.get('/clientes');
        setEmpresas(data);
      } catch { /* mantém [] */ }

      // CARREGA todas categorias para ADMIN
      try {
        const { data: cats } = await api.get('/categorias');
        setCategorias(cats);
      } catch { setCategorias([]); }
    }
  }

  useEffect(() => {
    load();

    function onReload(e) {
      if (!e?.detail || e.detail.target === 'products') load();
    }
    function onStorage(e) {
      if (e.key === 'data:reload' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (!payload || payload.target === 'products') load();
        } catch {}
      }
    }

    window.addEventListener('data:reload', onReload);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('data:reload', onReload);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Resolve o id da empresa do USER de forma segura
  function resolveEmpresaId() {
    return String(minhaEmpresa?.id ?? sessionEmpresa?.id ?? myEmpresaId ?? '');
  }

  function openNew() {
    setForm({ ...EMPTY, id_empresa: isUser ? resolveEmpresaId() : '' });
    setPreview(null); setAlert(null); setEditing(0);
  }

  async function openEdit(p) {
    try {
      const { data } = await api.get(`/produtos/${p.id}`);
      setForm({
        nome_produto: data.nome_produto,
        descricao:    data.descricao || '',
        id_empresa:   isUser ? resolveEmpresaId() : String(data.id_empresa),
          id_categoria: data.categoria ? String(data.categoria.id) : '',
            rank:          data.rank !== undefined && data.rank !== null ? String(data.rank) : '',
            valor:        String(data.valor),
            foto_produto: null
          });
      setPreview(data.foto_produto || null);
      setAlert(null);
      setEditing(p.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao carregar produto.');
    }
  }

  function close() { setEditing(null); setForm(EMPTY); setPreview(null); setAlert(null); }

  function pickFile(e) {
    const file = e.target.files[0] || null;
    setForm(f => ({ ...f, foto_produto: file }));
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function save(e) {
    e.preventDefault();
    setAlert(null);

    const fd = new FormData();
    fd.append('nome_produto', form.nome_produto);
    fd.append('descricao',    form.descricao);
    fd.append('id_empresa',   isUser ? resolveEmpresaId() : form.id_empresa);
    fd.append('id_categoria',  form.id_categoria);
    fd.append('rank',          form.rank);
    fd.append('valor',        form.valor);
    if (form.foto_produto) fd.append('foto_produto', form.foto_produto);

    try {
      if (editing === 0) await api.post('/produtos', fd);
      else               await api.put(`/produtos/${editing}`, fd);
      setAlert({ type: 'success', msg: 'Produto salvo com sucesso.' });
      // Notifica outras abas/componentes que devem recarregar products
      window.dispatchEvent(new CustomEvent('data:reload', { detail: { target: 'products' } }));
      localStorage.setItem('data:reload', JSON.stringify({ target: 'products', ts: Date.now() }));
      load();
      setTimeout(close, 1200);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Erro ao salvar.' });
    }
  }

  async function remove(id) {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      await api.delete(`/produtos/${id}`);
      // Notifica reload para products
      window.dispatchEvent(new CustomEvent('data:reload', { detail: { target: 'products' } }));
      localStorage.setItem('data:reload', JSON.stringify({ target: 'products', ts: Date.now() }));
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir.');
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = `${p.nome_produto} ${p.descricao || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchEmp    = filterEmp ? String(p.id_empresa) === filterEmp : true;
    return matchSearch && matchEmp;
  });

  function fmtMoney(v) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const empDisplay = minhaEmpresa ?? sessionEmpresa;
  const subtitulo  = isUser
    ? `Catálogo — ${empDisplay ? empDisplay.nome_completo : '...'}`
    : 'Catálogo de produtos por empresa.';

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">CADASTROS</p>
          <h1>Produtos</h1>
          <p>{subtitulo}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo produto
        </button>
      </div>

      {/* Erro de carregamento */}
      {loadError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{loadError}</div>
      )}

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Pesquisar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Seletor de empresa: somente ADMIN */}
          {!isUser && (
            <select
              className="btn btn-outline btn-sm"
              value={filterEmp}
              onChange={e => setFilterEmp(e.target.value)}
              style={{ fontWeight: 500 }}
            >
              <option value="">Todas as empresas</option>
              {empresas.map(e => <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>)}
            </select>
          )}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Foto</th><th>Nome</th><th>Valor</th><th>Empresa</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <img
                      className="thumb"
                      src={`${API}/produtos/${p.id}/foto`}
                      alt=""
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="thumb-placeholder" style={{ display: 'none' }}>
                      <ImageIcon size={18} />
                    </div>
                  </td>
                  <td>
                    <strong>{p.nome_produto}</strong>
                  </td>
                  <td><strong>{fmtMoney(p.valor)}</strong></td>
                  <td>{p.empresa?.nome_completo || `Empresa #${p.id_empresa}`}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(p)}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(p.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <div className="modal-overlay" onMouseDown={close}>
          <div className="modal modal-lg" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing === 0 ? 'Novo produto' : 'Editar produto'}</h2>
              <button onClick={close}>×</button>
            </div>

            <form className="form-grid" onSubmit={save}>
              <div className="form-group">
                <label>Nome do produto *</label>
                <input
                  required
                  value={form.nome_produto}
                  onChange={e => setForm({ ...form, nome_produto: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Empresa *</label>
                  {isUser ? (
                    <select
                      value={form.id_empresa}
                      disabled
                      style={{ background: '#f9fafb', color: '#374151', cursor: 'not-allowed' }}
                    >
                      {empDisplay
                        ? <option value={String(empDisplay.id)}>{empDisplay.nome_completo}</option>
                        : <option value={String(myEmpresaId)}>Empresa #{myEmpresaId}</option>
                      }
                    </select>
                  ) : (
                    <select
                      required
                      value={form.id_empresa}
                      onChange={e => setForm({ ...form, id_empresa: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {empresas.map(e => (
                        <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={form.id_categoria}
                    onChange={e => setForm({ ...form, id_categoria: e.target.value })}
                  >
                    <option value="">Nenhuma</option>
                    {categorias.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rank (opcional)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.rank}
                    onChange={e => setForm({ ...form, rank: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Valor (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor}
                    onChange={e => setForm({ ...form, valor: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Foto do produto {preview ? '— atual abaixo' : ''}</label>
                <input type="file" accept="image/*" onChange={pickFile} />
                {preview && <img className="preview-img" src={preview} alt="Foto atual" />}
              </div>

              {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
              <button className="btn btn-primary btn-full">Salvar produto</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
