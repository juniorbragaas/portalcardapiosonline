import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import api from '../services/api';

const EMPTY = { nome: '', id_empresa: '' };

export default function Categories() {
  const [items, setItems] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterEmp, setFilterEmp] = useState('');
  const [alert, setAlert] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isUser = currentUser.type === 'USER';

  async function load(id_empresa) {
    try {
      const params = id_empresa ? `?id_empresa=${id_empresa}` : '';
      const { data } = await api.get(`/categorias${params}`);
      setItems(data);
    } catch { setItems([]); }
  }

  useEffect(() => {
    async function init() {
      if (!isUser) {
        try {
          const { data } = await api.get('/clientes');
          setEmpresas(data);
        } catch { setEmpresas([]); }
      }

      // Se USER, backend já filtra por token; se ADMIN, carrega todas
      await load(isUser ? undefined : undefined);
    }
    init();

    // listeners para reload entre abas/componentes
    function onReload(e) { if (!e?.detail || e.detail.target === 'categories') load(filterEmp); }
    function onStorage(e) {
      if (e.key === 'data:reload' && e.newValue) {
        try { const payload = JSON.parse(e.newValue); if (!payload || payload.target === 'categories') load(filterEmp); } catch {}
      }
    }
    window.addEventListener('data:reload', onReload);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('data:reload', onReload); window.removeEventListener('storage', onStorage); };
  }, [filterEmp]);

  function openNew() {
    const id_emp = isUser ? String(currentUser.id_empresa || '') : filterEmp;
    setForm({ ...EMPTY, id_empresa: id_emp });
    setAlert(null);
    setEditing(0);
  }
  function openEdit(c) { setForm({ nome: c.nome, id_empresa: c.id_empresa ? String(c.id_empresa) : '' }); setAlert(null); setEditing(c.id); }
  function close() { setEditing(null); setForm(EMPTY); setAlert(null); }

  async function save(e) {
    e.preventDefault();
    setAlert(null);
    try {
      const payload = {
        nome: form.nome,
        id_empresa: isUser ? currentUser.id_empresa : form.id_empresa
      };
      if (editing === 0) await api.post('/categorias', payload);
      else               await api.put(`/categorias/${editing}`, payload);
      setAlert({ type: 'success', msg: 'Categoria salva.' });
      // notifica reload
      window.dispatchEvent(new CustomEvent('data:reload', { detail: { target: 'categories' } }));
      localStorage.setItem('data:reload', JSON.stringify({ target: 'categories', ts: Date.now() }));
      if (isUser) await load(); else await load(filterEmp);
      setTimeout(close, 900);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Erro ao salvar.' });
    }
  }

  async function remove(id) {
    if (!confirm('Deseja excluir esta categoria?')) return;
    try { await api.delete(`/categorias/${id}`);
      window.dispatchEvent(new CustomEvent('data:reload', { detail: { target: 'categories' } }));
      localStorage.setItem('data:reload', JSON.stringify({ target: 'categories', ts: Date.now() }));
      if (isUser) await load(); else await load(filterEmp);
    }
    catch (err) { alert(err.response?.data?.message || 'Erro ao excluir.'); }
  }

  const filtered = items.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">CADASTROS</p>
          <h1>Categorias</h1>
          <p>Gerencie categorias do sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Pesquisar categoria..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {!isUser && (
            <select className="btn btn-outline btn-sm" value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{ marginLeft: 12 }}>
              <option value="">Todas as empresas</option>
              {empresas.map(e => <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>)}
            </select>
          )}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>ID</th><th>Nome</th><th>Empresa</th><th>Criado em</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><strong>{c.nome}</strong></td>
                  <td>{empresas.find(x => x.id === c.id_empresa)?.nome_completo || (isUser ? 'Minha empresa' : '—')}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(c)} title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(c.id)} title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Nenhuma categoria encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <div className="modal-overlay" onMouseDown={close}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing === 0 ? 'Nova categoria' : 'Editar categoria'}</h2>
              <button onClick={close}>×</button>
            </div>

            <form className="form-grid" onSubmit={save}>
              <div className="form-group">
                <label>Nome *</label>
                <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome da categoria" />
              </div>

              {!isUser ? (
                <div className="form-group">
                  <label>Empresa *</label>
                  <select required value={form.id_empresa} onChange={e => setForm({ ...form, id_empresa: e.target.value })}>
                    <option value="">Selecione...</option>
                    {empresas.map(e => <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>)}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label>Empresa</label>
                  <input disabled value={empresas.find(x => x.id === currentUser.id_empresa)?.nome_completo || 'Minha empresa'} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={close}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Salvar</button>
              </div>

              {alert && <div className={`alert alert-${alert.type}`} style={{ marginTop: 12 }}>{alert.msg}</div>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}