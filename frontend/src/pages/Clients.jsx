import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, ExternalLink, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EMPTY = {
  nome_completo: '', alias: '', endereco: '', email: '',
  celular: '', descricao: '', status: true,
  latitude: '', longitude: '',
  logo: null, banner: null
};

const API = 'http://localhost:3000/api';

export default function Clients() {
  const [clients,  setClients]  = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [search,   setSearch]   = useState('');
  const [previews, setPreviews] = useState({ logo: null, banner: null });
  const [alert,    setAlert]    = useState(null);
  const navigate = useNavigate();

  async function load() {
    const { data } = await api.get('/clientes');
    setClients(data);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setPreviews({ logo: null, banner: null });
    setAlert(null);
    setEditing(0);
  }

  async function openEdit(c) {
    // Busca registro completo (com BLOBs em base64) para mostrar imagens existentes
    const { data } = await api.get(`/clientes/${c.id}`);
    setForm({
      nome_completo: data.nome_completo, alias: data.alias || '',
      endereco: data.endereco || '', email: data.email || '',
      celular: data.celular || '', descricao: data.descricao || '',
      status: data.status,
      latitude:  data.latitude  != null ? String(data.latitude)  : '',
      longitude: data.longitude != null ? String(data.longitude) : '',
      logo: null, banner: null
    });
    setPreviews({
      logo:   data.logo   || null,
      banner: data.banner || null
    });
    setAlert(null);
    setEditing(c.id);
  }
  function close() { setEditing(null); setForm(EMPTY); setAlert(null); }

  function pickFile(field, e) {
    const file = e.target.files[0] || null;
    setForm(f => ({ ...f, [field]: file }));
    if (file) setPreviews(p => ({ ...p, [field]: URL.createObjectURL(file) }));
  }

  async function save(e) {
    e.preventDefault();
    setAlert(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v instanceof File) fd.append(k, v);
      else if (v !== null)   fd.append(k, String(v));
    });
    // Garante que latitude/longitude vazios sejam enviados como string vazia
    fd.append('latitude', form.latitude || '');
    fd.append('longitude', form.longitude || '');
    try {
      if (editing === 0) await api.post('/clientes', fd);
      else               await api.put(`/clientes/${editing}`, fd);
      setAlert({ type: 'success', msg: 'Empresa salva com sucesso.' });
      load();
      setTimeout(close, 1200);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Erro ao salvar.' });
    }
  }

  async function remove(id) {
    if (!confirm('Deseja excluir esta empresa?')) return;
    try { await api.delete(`/clientes/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Erro.'); }
  }

  const filtered = clients.filter(c =>
    `${c.nome_completo} ${c.alias || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">CADASTROS</p>
          <h1>Empresas</h1>
          <p>Gerencie as empresas cadastradas.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nova empresa
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Pesquisar empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Logo</th><th>Nome</th><th>Alias</th>
                <th>Email</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <img
                      className="thumb"
                      src={`${API}/clientes/${c.id}/logo`}
                      alt=""
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                    />
                    <div className="thumb-placeholder" style={{ display: 'none' }}><ImageIcon size={18} /></div>
                  </td>
                  <td><strong>{c.nome_completo}</strong></td>
                  <td>{c.alias || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>
                    <span className={`badge ${c.status ? 'badge-green' : 'badge-red'}`}>
                      {c.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="btn btn-accent btn-sm btn-icon"
                        title="Ver cardápio público"
                        onClick={() => navigate(`/${c.alias}`)}
                        disabled={!c.alias}
                        style={{ opacity: c.alias ? 1 : 0.4 }}
                      >
                        <ExternalLink size={15} />
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                      <button className="btn btn-danger  btn-sm btn-icon" onClick={() => remove(c.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Nenhuma empresa encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <div className="modal-overlay" onMouseDown={close}>
          <div className="modal modal-lg" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing === 0 ? 'Nova empresa' : 'Editar empresa'}</h2>
              <button onClick={close}>×</button>
            </div>

            <form className="form-grid" onSubmit={save}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome completo *</label>
                  <input required value={form.nome_completo} onChange={e => setForm({ ...form, nome_completo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Alias</label>
                  <input value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Celular</label>
                  <input value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    placeholder="Ex: -23.5505"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    placeholder="Ex: -46.6333"
                  />
                </div>
              </div>

              {/* Mini mapa — Google Maps embed */}
              {form.latitude && form.longitude &&
               !isNaN(parseFloat(form.latitude)) &&
               !isNaN(parseFloat(form.longitude)) && (
                <div className="form-group">
                  <label><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />Prévia do mapa</label>
                  <div className="mini-map-wrap">
                    <iframe
                      title="Mini mapa"
                      src={`https://maps.google.com/maps?q=${parseFloat(form.latitude)},${parseFloat(form.longitude)}&z=15&output=embed`}
                      width="100%"
                      height="220"
                      style={{ border: 0, borderRadius: 8 }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows={3} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Logo {previews.logo ? '— atual abaixo' : ''}</label>
                  <input type="file" accept="image/*" onChange={e => pickFile('logo', e)} />
                  {previews.logo && (
                    <img className="preview-img" src={previews.logo} alt="Logo atual" />
                  )}
                </div>
                <div className="form-group">
                  <label>Banner {previews.banner ? '— atual abaixo' : ''}</label>
                  <input type="file" accept="image/*" onChange={e => pickFile('banner', e)} />
                  {previews.banner && (
                    <img className="preview-img" src={previews.banner} alt="Banner atual" />
                  )}
                </div>
              </div>

              <label className="form-check">
                <input type="checkbox" checked={form.status} onChange={e => setForm({ ...form, status: e.target.checked })} />
                Empresa ativa
              </label>

              {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
              <button className="btn btn-primary btn-full">Salvar empresa</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
