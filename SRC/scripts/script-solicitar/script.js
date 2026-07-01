// ===== Configuração inicial =====
const LUANDA_CENTRO = [-8.8147, 13.2302]; // Centro, Luanda (referência da imagem)

let map;
let originMarker;
let destMarker;
let routeLine;

let originCoords = { lat: LUANDA_CENTRO[0], lng: LUANDA_CENTRO[1] };
let destCoords = null;

// ===== Inicializar mapa =====
function initMap() {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
  }).setView(LUANDA_CENTRO, 15);

  // Tema escuro (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  originMarker = createPinMarker(originCoords.lat, originCoords.lng).addTo(map);
}

// ===== Marcador customizado (pin verde estilo da imagem) =====
function createPinMarker(lat, lng) {
  const icon = L.divIcon({
    className: '',
    html: `
      <div class="pin-marker">
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
          <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27C34 7.6 26.4 0 17 0z" fill="#37e85b"/>
          <circle cx="17" cy="17" r="7" fill="#0b0d10"/>
        </svg>
        <div class="pin-glow"></div>
      </div>`,
    iconSize: [34, 50],
    iconAnchor: [17, 50],
  });
  return L.marker([lat, lng], { icon, interactive: false });
}

// ===== Botão "usar localização atual" =====
function useCurrentLocation() {
  if (!navigator.geolocation) {
    setOrigin(LUANDA_CENTRO[0], LUANDA_CENTRO[1], 'A minha localização');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setOrigin(pos.coords.latitude, pos.coords.longitude, 'A minha localização');
      map.setView([pos.coords.latitude, pos.coords.longitude], 16);
    },
    () => {
      // fallback: mantém centro de Luanda caso a permissão seja negada
      setOrigin(LUANDA_CENTRO[0], LUANDA_CENTRO[1], 'A minha localização');
    }
  );
}

function setOrigin(lat, lng, label) {
  originCoords = { lat, lng };
  document.getElementById('origin-value').textContent = label;
  if (originMarker) map.removeLayer(originMarker);
  originMarker = createPinMarker(lat, lng).addTo(map);
  if (destCoords) drawRoute();
}

// ===== Recentralizar mapa =====
function recenterMap() {
  map.setView([originCoords.lat, originCoords.lng], 16, { animate: true });
}

// ===== Selecionar destino (a partir das sugestões recentes) =====
function selectDestination(name, address, lat, lng) {
  destCoords = { lat, lng };
  document.getElementById('dest-input').value = `${name} — ${address}`;

  if (destMarker) map.removeLayer(destMarker);
  destMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="9" fill="#1e2227" stroke="#37e85b" stroke-width="2.5"/><circle cx="13" cy="13" r="3.5" fill="#37e85b"/></svg>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    }),
  }).addTo(map);

  drawRoute();
  showTripDetails(lat, lng);

  const bounds = L.latLngBounds([
    [originCoords.lat, originCoords.lng],
    [lat, lng],
  ]);
  map.fitBounds(bounds, { padding: [60, 60] });
}

// ===== Desenhar linha de rota (simples, em linha reta estilizada) =====
function drawRoute() {
  if (!destCoords) return;
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline(
    [
      [originCoords.lat, originCoords.lng],
      [destCoords.lat, destCoords.lng],
    ],
    {
      color: '#37e85b',
      weight: 4,
      opacity: 0.85,
      dashArray: '1, 8',
      lineCap: 'round',
    }
  ).addTo(map);
}

// ===== Calcular distância (haversine) e exibir estimativas =====
function showTripDetails(lat, lng) {
  const distanceKm = haversineDistance(originCoords.lat, originCoords.lng, lat, lng);
  const timeMin = Math.max(3, Math.round((distanceKm / 28) * 60)); // ~28km/h média urbana
  const pricePerKm = 480; // Kz por km (estimativa)
  const baseFare = 400;
  const price = Math.round(baseFare + distanceKm * pricePerKm);

  document.getElementById('stat-distance').textContent = `${distanceKm.toFixed(1).replace('.', ',')} km`;
  document.getElementById('stat-time').textContent = `${timeMin} min`;
  document.getElementById('stat-price').textContent = `${formatKz(price)} Kz`;

  document.getElementById('trip-stats').classList.add('visible');
  document.getElementById('confirm-btn').classList.add('visible');
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function formatKz(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ===== Eventos =====
document.addEventListener('DOMContentLoaded', () => {
  initMap();

  document.getElementById('use-current-location').addEventListener('click', useCurrentLocation);
  document.getElementById('recenter-btn').addEventListener('click', recenterMap);

  document.querySelectorAll('.recent-item').forEach((item) => {
    item.addEventListener('click', () => {
      const { name, address, lat, lng } = item.dataset;
      selectDestination(name, address, parseFloat(lat), parseFloat(lng));
    });
  });

  document.getElementById('confirm-btn').addEventListener('click', () => {
    alert('Destino confirmado! A procurar motorista...');
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    history.back();
  });
});
