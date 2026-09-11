import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import api from '../services/api';

const EMPTY = { login: '', password: '', type: 'USER' };

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null); // null = closed, 0 = new, id = edit
  const [search,  setSearch]  = useState('');
  const [alert,   setAlert]   = useState(null); // { type, msg }

  async function load() {
    const { data } = await api.get('/usuarios');
    setUsers(data);
  }
  useEffect(() => { load(); }, []);

  function openNew()   { setForm(EMPTY);                                          setEditing(0); }
  function openEdit(u) { setForm({ login: u.login, password: '', type: u.type }); setEditing(u.id); }
  function close()     { setEditing(null); setForm(EMPTY); setAlert(null); }

  async function save(e) {
    e.preventDefault();
    setAlert(null);
    try {
      if (editing === 0) await api.post('/usuarios', form);
      else               await api.put(`/usuarios/${editing}`, form);
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
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {editing !== null && (
        <div className="modal-overlay" onMouseDown={close}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing === 0 ? 'Novo usuário' : 'Editar usuário'}</h2>
              <button onClick={close}>×</button>
            </div>

            <form className="form-grid" onSubmit={save}>
              <div className="form-group">
                <label>Login</label>
                <input
                  required
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
                  placeholder="nome de usuário"
                />
              </div>
              <div className="form-group">
                <label>Senha {editing !== 0 && <span style={{ fontWeight: 400, color: '#9ca3af' }}>(deixe em branco para manter)</span>}</label>
                <input
                  type="password"
                  required={editing === 0}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

              <button className="btn btn-primary btn-full">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
