import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

export default function CardapioQrcode() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const sessionEmpresa = JSON.parse(sessionStorage.getItem('empresa') || 'null');
  const empresaAlias = sessionEmpresa?.alias || (user.type === 'USER' ? user.login : null);

  const [url, setUrl] = useState('');
  const [sizeCm, setSizeCm] = useState(8); // padrão em cm
  const [pngDataUrl, setPngDataUrl] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!empresaAlias) {
      navigate('/admin');
      return;
    }
    const link = `${window.location.origin}/${empresaAlias}`;
    setUrl(link);
  }, [empresaAlias]);

  useEffect(() => {
    if (!url) return;
    // Converte tamanho em cm para pixels: assume 96dpi -> 1in = 96px, 1in = 2.54cm
    const dpi = 96;
    const sizePx = Math.round((sizeCm / 2.54) * dpi);

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = sizePx;
    canvas.height = sizePx;

    QRCode.toCanvas(canvas, url, { width: sizePx, margin: 1 }, function (error) {
      if (error) return console.error(error);
      const dataUrl = canvas.toDataURL('image/png');
      setPngDataUrl(dataUrl);
    });
  }, [url, sizeCm]);

  function downloadImage() {
    if (!pngDataUrl) return;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = `cardapio-${empresaAlias}.png`;
    a.click();
  }

  function downloadPDF() {
    if (!pngDataUrl) return;
    // Gera PDF simples usando janela nova e impressão
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>QR Code</title><style>body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0}img{width:${sizeCm}cm;height:${sizeCm}cm}</style></head><body><img src="${pngDataUrl}" /></body></html>`;
    const w = window.open('about:blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    // Delay para garantir render antes de print
    setTimeout(() => { w.print(); }, 500);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h2>Cardápio QR Code</h2>
      <p>QR code para acessar o cardápio da sua empresa: <strong>{empresaAlias}</strong></p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Tamanho (cm):
          <input type="number" min="2" max="30" value={sizeCm} onChange={e => setSizeCm(Number(e.target.value))} style={{ width: 80, padding: '6px 8px' }} />
        </label>
        <button className="btn btn-outline" onClick={downloadImage}>Salvar como imagem</button>
        <button className="btn btn-primary" onClick={downloadPDF}>Salvar como PDF</button>
      </div>

      <div style={{ border: '1px solid #e5e7eb', padding: 20, display: 'inline-block' }}>
        <canvas ref={canvasRef} style={{ width: `${sizeCm}cm`, height: `${sizeCm}cm` }} />
      </div>

      {!url && <p style={{ color: '#9ca3af' }}>Alias da empresa não encontrado.</p>}
    </div>
  );
}
