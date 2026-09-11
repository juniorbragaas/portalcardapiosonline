import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const EMPTY = {
  nome_produto: '', descricao: '', id_empresa: '', valor: '', foto_produto: null
};

export default function Products() {
  const [products,  setProducts]  = useState([]);
  const [empresas,  setEmpresas]  = useState([]);
  const [form,      setForm]      = useState(EMPTY);
  const [editing,   setEditing]   = useState(null);
  const [search,    setSearch]    = useState('');
  const [preview,   setPreview]   = useState(null);
  const [alert,     setAlert]     = useState(null);
  const [filterEmp, setFilterEmp] = useState('');

  async function load() {
    const [p, e] = await Promise.all([api.get('/produtos'), api.get('/clientes')]);
    setProducts(p.data);
    setEmpresas(e.data);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY); setPreview(null); setAlert(null); setEditing(0);
  }
  function openEdit(p) {
    setForm({
      nome_produto: p.nome_produto,
      descricao:    p.descricao || '',
      id_empresa:   String(p.id_empresa),
      valor:        String(p.valor),
      foto_produto: null
    });
    setPreview(null);
    setAlert(null);
    setEditing(p.id);
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
    fd.append('id_empresa',   form.id_empresa);
    fd.append('valor',        form.valor);
    if (form.foto_produto) fd.append('foto_produto', form.foto_produto);

    try {
      if (editing === 0) await api.post('/produtos', fd);
      else               await api.put(`/produtos/${editing}`, fd);
      setAlert({ type: 'success', msg: 'Produto salvo com sucesso.' });
      load();
      setTimeout(close, 1200);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Erro ao salvar.' });
    }
  }

  async function remove(id) {
    if (!confirm('Deseja excluir este produto?')) return;
    try { await api.delete(`/produtos/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Erro.'); }
  }

  const filtered = products.filter(p => {
    const matchSearch = `${p.nome_produto} ${p.descricao || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchEmp    = filterEmp ? String(p.id_empresa) === filterEmp : true;
    return matchSearch && matchEmp;
  });

  function fmtMoney(v) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">CADASTROS</p>
          <h1>Produtos</h1>
          <p>Catálogo de produtos por empresa.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo produto
        </button>
      </div>

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
          <select
            className="btn btn-outline btn-sm"
            value={filterEmp}
            onChange={e => setFilterEmp(e.target.value)}
            style={{ fontWeight: 500 }}
          >
            <option value="">Todas as empresas</option>
            {empresas.map(e => <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>)}
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Foto</th><th>Produto</th><th>Empresa</th><th>Valor</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.foto_produto
                      ? <img className="thumb" src={p.foto_produto} alt="" />
                      : <div className="thumb-placeholder"><ImageIcon size={18} /></div>}
                  </td>
                  <td>
                    <strong>{p.nome_produto}</strong>
                    {p.descricao && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.descricao.slice(0, 60)}{p.descricao.length > 60 ? '…' : ''}</div>}
                  </td>
                  <td>{p.empresa?.nome_completo || p.id_empresa}</td>
                  <td><strong>{fmtMoney(p.valor)}</strong></td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(p)}><Pencil size={15} /></button>
                      <button className="btn btn-danger  btn-sm btn-icon" onClick={() => remove(p.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Nenhum produto encontrado.</td></tr>
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
                <input required value={form.nome_produto} onChange={e => setForm({ ...form, nome_produto: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows={3} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Empresa *</label>
                  <select required value={form.id_empresa} onChange={e => setForm({ ...form, id_empresa: e.target.value })}>
                    <option value="">Selecione...</option>
                    {empresas.map(e => <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>)}
                  </select>
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
                <label>Foto do produto</label>
                <input type="file" accept="image/*" onChange={pickFile} />
                {preview && <img className="preview-img" src={preview} alt="Preview" />}
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
