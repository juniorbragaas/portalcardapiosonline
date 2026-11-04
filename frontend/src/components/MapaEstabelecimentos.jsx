import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ChevronDown, Check } from 'lucide-react';

/**
 * Ícone de marcador personalizado (divIcon) — evita problemas
 * de path de imagem do Leaflet com bundlers como o Vite.
 */
const pinIcon = L.divIcon({
  className: 'map-pin',
  html: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

/**
 * Mapa com todos os estabelecimentos cadastrados.
 * Mostra o nome acima de cada marcador e possui filtro múltiplo.
 *
 * @param {Array} clientes — lista de clientes com latitude/longitude
 */
export default function MapaEstabelecimentos({ clientes, onSelectionChange }) {
  const [selected, setSelected] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mapEl = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const dropdownRef = useRef(null);

  // Estabelecimentos que possuem coordenadas válidas
  const comCoords = clientes.filter(c => c.latitude != null && c.longitude != null);

  /* Inicializa seleção com todos os que têm coordenadas */
  useEffect(() => {
    setSelected(comCoords.map(c => c.id));
  }, [clientes]);

  /* Notifica o componente pai quando a seleção muda */
  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected]);

  /* Inicializa o mapa Leaflet uma única vez */
  useEffect(() => {
    if (!mapEl.current || mapInstance.current) return;

    mapInstance.current = L.map(mapEl.current, {
      center: [-14.235, -51.9253], // centro do Brasil
      zoom: 4,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(mapInstance.current);

    // Força o recálculo do tamanho após o render (corrizes "tiles cinzas")
    setTimeout(() => mapInstance.current?.invalidateSize(), 200);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  /* Atualiza marcadores quando a seleção ou os dados mudam */
  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpa marcadores anteriores
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const pontos = clientes.filter(c =>
      selected.includes(c.id) &&
      c.latitude != null && c.longitude != null
    );

    pontos.forEach(c => {
      const marker = L.marker([parseFloat(c.latitude), parseFloat(c.longitude)], { icon: pinIcon })
        .addTo(mapInstance.current);

      // Nome do estabelecimento acima do marcador
      marker.bindTooltip(c.nome_completo, {
        permanent: true,
        direction: 'top',
        className: 'map-label',
        offset: [0, -10]
      });

      markersRef.current.push(marker);
    });

    // Ajusta o zoom para enquadrar todos os marcadores visíveis
    if (pontos.length > 0) {
      const bounds = L.latLngBounds(pontos.map(c => [parseFloat(c.latitude), parseFloat(c.longitude)]));
      mapInstance.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else {
      mapInstance.current.setView([-14.235, -51.9253], 4);
    }
  }, [selected, clientes]);

  /* Fecha o dropdown ao clicar fora */
  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggleId(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const label = selected.length === comCoords.length && comCoords.length > 0
    ? 'Todas as empresas'
    : selected.length === 0
      ? 'Nenhuma selecionada'
      : `${selected.length} selecionada(s)`;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">
          <MapPin size={18} />
          <h2>Mapa de Estabelecimentos</h2>
        </div>

        {/* Filtro múltiplo */}
        {comCoords.length > 0 && (
          <div className="chart-multiselect" ref={dropdownRef}>
            <button className="btn btn-outline btn-sm" onClick={() => setDropdownOpen(v => !v)}>
              {label}
              <ChevronDown size={14} />
            </button>

            {dropdownOpen && (
              <div className="chart-dropdown">
                <div className="chart-dropdown-actions">
                  <button className="chart-dropdown-link" onClick={() => setSelected(comCoords.map(c => c.id))}>
                    Selecionar todas
                  </button>
                  <button className="chart-dropdown-link" onClick={() => setSelected([])}>
                    Limpar
                  </button>
                </div>
                <div className="chart-dropdown-list">
                  {comCoords.map(c => (
                    <label key={c.id} className="chart-dropdown-item">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={() => toggleId(c.id)}
                      />
                      <span>{c.nome_completo}</span>
                      {selected.includes(c.id) && <Check size={14} />}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Container do mapa — sempre renderizado para o Leaflet inicializar */}
      <div ref={mapEl} className="map-container" />

      {comCoords.length === 0 && (
        <p className="map-hint">
          <MapPin size={16} /> Nenhum estabelecimento possui coordenadas (latitude/longitude) cadastradas.
        </p>
      )}
    </div>
  );
}
