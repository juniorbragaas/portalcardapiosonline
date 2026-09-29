import { useEffect, useState } from 'react';
import { ExternalLink, QrCode, Search, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';

const API = 'http://localhost:3000/api';

export default function Cardapios() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [qr, setQr] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/clientes');
      // Filtra empresas que possuem alias (cardápio público)
      const hasCardapio = data.filter(c => c.alias);
      setClients(hasCardapio);
    } catch (err) {
      setClients([]);
    }
  }

  useEffect(() => { load(); }, []);

  function openCardapio(alias) {
    const url = `${window.location.origin}/${alias}`;
    window.open(url, '_blank');
  }

  function showQr(alias) {
    const url = `${window.location.origin}/${alias}`;
    // Usa QR server público para gerar imagem
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(url)}`;
    setQr({ url, img: qrUrl });
  }

  function closeQr() { setQr(null); }

  const filtered = clients.filter(c => `${c.nome_completo} ${c.alias || ''}`.toLowerCase().includes(search.toLowerCase()));

  async function remove(id) {
    if (!confirm('Deseja excluir esta empresa?')) return;
    try { await api.delete(`/clientes/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Erro.'); }
  }

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">SISTEMA</p>
          <h1>Cardápios públicos</h1>
          <p>Empresas com cardápios públicos (alias definido).</p>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Logo</th><th>Nome</th><th>Alias</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{String(c.id).padStart(4, '0')}</td>
                  <td>
                    <img className="thumb" src={`${API}/clientes/${c.id}/logo`} alt="" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                    <div className="thumb-placeholder" style={{ display: 'none' }}><ImageIcon size={18} /></div>
                  </td>
                  <td><strong>{c.nome_completo}</strong></td>
                  <td>{c.alias}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-accent btn-sm btn-icon" title="Abrir cardápio" onClick={() => openCardapio(c.alias)}>
                        <ExternalLink size={15} />
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" title="Mostrar QR" onClick={() => showQr(c.alias)}>
                        <QrCode size={15} />
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => window.location.href = `/admin/empresas`} title="Editar empresa">
                        <Pencil size={15} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Nenhuma empresa com cardápio público encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {qr && (
        <div className="modal-overlay" onMouseDown={closeQr}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>QR Code do cardápio</h2>
              <button onClick={closeQr}>×</button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src={qr.img} alt="QR Code" style={{ width: 260, height: 260 }} />
              <p style={{ marginTop: 12 }}>{qr.url}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(qr.url)}>Copiar link</button>
                <a className="btn btn-primary" href={qr.url} target="_blank" rel="noreferrer">Abrir</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
