// ===== Configuração inicial =====
const HUAMBO_CENTRO = [-12.7761, 15.7392]; // Centro do Huambo, Angola (localização padrão)

let mapa;
let marcadorOrigem;
let circuloPrecisao;
let coordenadasOrigem = { lat: HUAMBO_CENTRO[0], lng: HUAMBO_CENTRO[1] };

// ===== Ajustar posições dos botões com base no header/menu inferior =====
function ajustarPosicoes() {
  const cabecalho = document.querySelector('header');
  const menuInferior = document.querySelector('.menu-bottom'); // TODO: troque pelo seletor real quando houver

  if (cabecalho) {
    document.documentElement.style.setProperty('--altura-header', `${cabecalho.offsetHeight}px`);
  }
  if (menuInferior) {
    document.documentElement.style.setProperty('--altura-menu-inferior', `${menuInferior.offsetHeight}px`);
  }
}

// ===== Inicializar mapa =====
function inicializarMapa() {
  mapa = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
  }).setView(HUAMBO_CENTRO, 15);

  const camadaTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
    detectRetina: false,
    updateWhenZooming: false,
    keepBuffer: 2,
  }).addTo(mapa);

  // pin inicial no fallback (Huambo), será substituído quando a localização real chegar
  marcadorOrigem = criarMarcadorPin(coordenadasOrigem.lat, coordenadasOrigem.lng).addTo(mapa);

  mapa.invalidateSize();
  window.addEventListener('resize', () => mapa.invalidateSize());
}

// ===== Marcador customizado (pin verde com brilho) =====
function criarMarcadorPin(lat, lng) {
  const icone = L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:20px;height:20px;border-radius:50%;background:#5dd428;
                    box-shadow:0 0 0 8px rgba(93,212,40,0.25), 0 0 20px 6px rgba(93,212,40,0.6);
                    border:2px solid #fff;"></div>
      </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  return L.marker([lat, lng], { icon: icone, interactive: false, zIndexOffset: 1000 });
}

// ===== Buscar e centralizar localização atual =====
function usarLocalizacaoAtual() {
  if (!navigator.geolocation) {
    definirOrigem(HUAMBO_CENTRO[0], HUAMBO_CENTRO[1]);
    mapa.setView([HUAMBO_CENTRO[0], HUAMBO_CENTRO[1]], 16);
    return;
  }

  const botao = document.getElementById('use-current-location');
  if (botao) botao.style.opacity = '0.6';

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      const { latitude, longitude, accuracy } = posicao.coords;
      definirOrigem(latitude, longitude, accuracy);
      mapa.setView([latitude, longitude], 16);
      if (botao) botao.style.opacity = '1';
    },
    (erro) => {
      console.warn('Não foi possível obter a localização:', erro.message);
      definirOrigem(HUAMBO_CENTRO[0], HUAMBO_CENTRO[1]);
      if (botao) botao.style.opacity = '1';
    },
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
  );
}

// ===== Define a origem, redesenha o pin e o círculo de precisão =====
function definirOrigem(lat, lng, precisao) {
  coordenadasOrigem = { lat, lng };

  if (marcadorOrigem) mapa.removeLayer(marcadorOrigem);
  marcadorOrigem = criarMarcadorPin(lat, lng).addTo(mapa);

  if (circuloPrecisao) mapa.removeLayer(circuloPrecisao);
  if (precisao) {
    circuloPrecisao = L.circle([lat, lng], {
      radius: precisao,
      color: '#5dd428',
      weight: 1,
      fillColor: '#5dd428',
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(mapa);
  }
}

// ===== Recentralizar mapa na origem =====
function recentralizarMapa() {
  mapa.setView([coordenadasOrigem.lat, coordenadasOrigem.lng], 16, { animate: true });
}

// ===== Eventos =====
document.addEventListener('DOMContentLoaded', () => {
  ajustarPosicoes();
  inicializarMapa();
  usarLocalizacaoAtual(); // busca a localização automaticamente ao abrir a página

  document.getElementById('use-current-location').addEventListener('click', usarLocalizacaoAtual);
  document.getElementById('recenter-btn').addEventListener('click', recentralizarMapa);

  window.addEventListener('resize', ajustarPosicoes);
});