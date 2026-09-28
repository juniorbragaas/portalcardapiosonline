import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import api from '../services/api';

const EMPTY = { login: '', password: '', type: 'USER', id_empresa: '' };

export default function Users() {
  const [users,    setUsers]    = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [search,   setSearch]   = useState('');
  const [alert,    setAlert]    = useState(null);

  async function load() {
    const [u, e] = await Promise.all([api.get('/usuarios'), api.get('/clientes')]);
    setUsers(u.data);
    setEmpresas(e.data);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY); setAlert(null); setEditing(0);
  }

  function openEdit(u) {
    setForm({
      login:      u.login,
      password:   '',
      type:       u.type,
      id_empresa: u.id_empresa ? String(u.id_empresa) : ''
    });
    setAlert(null);
    setEditing(u.id);
  }

  function close() { setEditing(null); setForm(EMPTY); setAlert(null); }

  async function save(e) {
    e.preventDefault();
    setAlert(null);

    const payload = {
      login:      form.login,
      usertype:   form.type,
      id_empresa: form.type === 'USER' ? (form.id_empresa || null) : null
    };
    if (form.password) payload.password = form.password;
    if (editing === 0)  payload.password = form.password; // obrigatório no create

    try {
      if (editing === 0) await api.post('/usuarios', payload);
      else               await api.put(`/usuarios/${editing}`, payload);
      setAlert({ type: 'success', msg: 'Usuário salvo com sucesso.' });
      load();
      setTimeout(close, 1200);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Erro ao salvar.' });
    }
  }

  async function remove(id) {
    if (!confirm('Deseja excluir este usuário?')) return;
    try { await api.delete(`/usuarios/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Erro ao excluir.'); }
  }

  function empresaNome(id) {
    const e = empresas.find(e => e.id === id);
    return e ? e.nome_completo : '—';
  }

  const filtered = users.filter(u =>
    u.login.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">CADASTROS</p>
          <h1>Usuários</h1>
          <p>Gerencie os acessos ao sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo usuário
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Pesquisar por login..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Login</th>
                <th>Tipo</th>
                <th>Empresa vinculada</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.login}</strong></td>
                  <td>
                    <span className={`badge ${u.type === 'ADMIN' ? 'badge-blue' : 'badge-gray'}`}>
                      {u.type}
                    </span>
                  </td>
                  <td>
                    {u.id_empresa
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Building2 size={13} style={{ color: '#6b7280' }} />
                          {empresaNome(u.id_empresa)}
                        </span>
                      : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(u)} title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(u.id)} title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <div className="modal-overlay" onMouseDown={close}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing === 0 ? 'Novo usuário' : 'Editar usuário'}</h2>
              <button onClick={close}>×</button>
            </div>

            <form className="form-grid" onSubmit={save}>
              <div className="form-group">
                <label>Login *</label>
                <input
                  required
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
                  placeholder="nome de usuário"
                />
              </div>

              <div className="form-group">
                <label>
                  Senha
                  {editing !== 0 && <span style={{ fontWeight: 400, color: '#9ca3af' }}> (deixe em branco para manter)</span>}
                </label>
                <input
                  type="password"
                  required={editing === 0}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value, id_empresa: '' })}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Empresa vinculada — obrigatório para USER */}
              {form.type === 'USER' && (
                <div className="form-group">
                  <label>Empresa vinculada *</label>
                  <select
                    required
                    value={form.id_empresa}
                    onChange={e => setForm({ ...form, id_empresa: e.target.value })}
                  >
                    <option value="">Selecione a empresa...</option>
                    {empresas.map(e => (
                      <option key={e.id} value={String(e.id)}>{e.nome_completo}</option>
                    ))}
                  </select>
                  <small style={{ color: '#6b7280', fontSize: 12 }}>
                    Este usuário só poderá gerenciar produtos desta empresa.
                  </small>
                </div>
              )}

              {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
              <button className="btn btn-primary btn-full">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
