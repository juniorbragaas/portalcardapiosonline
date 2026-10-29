import { useEffect, useState } from 'react';
import { Search, ExternalLink, QrCode, Image as ImageIcon, Copy, Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';

const API = 'http://localhost:3000/api';

export default function CardapiosAdmin() {
  const [clients,   setClients]   = useState([]);
  const [search,    setSearch]    = useState('');
  const [qrClient,  setQrClient]  = useState(null);
  const [copied,    setCopied]    = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isUser      = currentUser.type === 'USER';

  async function load() {
    try {
      if (isUser) {
        // USER: busca apenas a empresa vinculada ao seu usuário
        const { data } = await api.get('/clientes/minha-empresa');
        setClients([data]);
      } else {
        // ADMIN: lista todas as empresas
        const { data } = await api.get('/clientes');
        setClients(data);
      }
    } catch { /* ignora */ }
  }
  useEffect(() => { load(); }, []);

  // Monta a URL pública do cardápio
  function cardapioUrl(alias) {
    return `${window.location.origin}/${alias}`;
  }

  // Abre o cardápio em nova aba
  function abrirCardapio(alias) {
    window.open(cardapioUrl(alias), '_blank', 'noopener,noreferrer');
  }

  // Copia a URL para a área de transferência
  async function copiarUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback silencioso */ }
  }

  // Baixa o QR code como PNG
  function baixarQr(alias) {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode-${alias}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const filtered = clients.filter(c =>
    `${c.nome_completo} ${c.alias || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="page-hd">
        <div className="page-hd-left">
          <p className="eyebrow">CARDAPIOS</p>
          <h1>Cardápios</h1>
          <p>{isUser
            ? 'Visualize seu cardápio e gere o QR Code da sua empresa.'
            : 'Visualize os cardápios públicos e gere QR Codes das empresas.'}
          </p>
        </div>
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
                <th>ID</th><th>Logo</th><th>Empresa</th><th>Alias</th>
                <th>Status</th><th>Cardápio</th><th>QR Code</th>
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
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="thumb-placeholder" style={{ display: 'none' }}>
                      <ImageIcon size={18} />
                    </div>
                  </td>
                  <td><strong>{c.nome_completo}</strong></td>
                  <td>{c.alias || '—'}</td>
                  <td>
                    <span className={`badge ${c.status ? 'badge-green' : 'badge-red'}`}>
                      {c.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-accent btn-sm"
                      title="Abrir cardápio em nova aba"
                      onClick={() => abrirCardapio(c.alias)}
                      disabled={!c.alias}
                      style={{ opacity: c.alias ? 1 : 0.4 }}
                    >
                      <ExternalLink size={14} /> Abrir
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      title="Gerar QR Code"
                      onClick={() => { setQrClient(c); setCopied(false); }}
                      disabled={!c.alias}
                      style={{ opacity: c.alias ? 1 : 0.4 }}
                    >
                      <QrCode size={14} /> Gerar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de QR Code */}
      {qrClient && (
        <div className="modal-overlay" onMouseDown={() => setQrClient(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>QR Code — {qrClient.nome_completo}</h2>
              <button onClick={() => setQrClient(null)}><X size={18} /></button>
            </div>

            <div className="qr-body">
              <div id="qr-canvas" className="qr-canvas-wrap">
                <QRCodeCanvas
                  value={cardapioUrl(qrClient.alias)}
                  size={220}
                  level="M"
                  includeMargin
                />
              </div>

              <div className="qr-url-row">
                <input
                  className="qr-url-input"
                  readOnly
                  value={cardapioUrl(qrClient.alias)}
                  onClick={e => e.target.select()}
                />
                <button
                  className="btn btn-outline btn-sm btn-icon"
                  title="Copiar URL"
                  onClick={() => copiarUrl(cardapioUrl(qrClient.alias))}
                >
                  <Copy size={15} />
                </button>
              </div>

              {copied && <p className="qr-copied">URL copiada!</p>}

              <button
                className="btn btn-primary btn-full"
                onClick={() => baixarQr(qrClient.alias)}
              >
                <Download size={16} /> Baixar QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
