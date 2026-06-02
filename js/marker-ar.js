
const params = new URLSearchParams(window.location.search);
const mediaUrl = params.get('data') || params.get('img') || '';
const type = params.get('type') || 'image';
const title = params.get('title') || 'Realidad Aumentada INTER SG';

const titleText = document.getElementById('titleText');
const errorBox = document.getElementById('errorBox');
const actionBox = document.getElementById('actionBox');
const actionText = document.getElementById('actionText');
const manualShowBtn = document.getElementById('manualShowBtn');
const playVideoBtn = document.getElementById('playVideoBtn');
const youtubeBtn = document.getElementById('youtubeBtn');
const mediaLayer = document.getElementById('mediaLayer');
const marker = document.getElementById('interMarker');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');

titleText.textContent = title;

let scale = 1;
let markerDetected = false;
let videoElement = null;

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function showAction(message) {
  actionText.textContent = message;
  actionBox.style.display = 'block';
}

function showMedia() {
  if (!mediaLayer.innerHTML.trim()) return;
  mediaLayer.style.display = 'flex';
  showAction('Contenido visible. Puedes agrandar o reducir con los controles.');
}

function hideMediaIfMarkerLost() {
  if (!markerDetected) {
    mediaLayer.style.display = 'none';
  }
}

function applyScale() {
  mediaLayer.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function extractYoutubeId(url) {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  try {
    return new URL(url).searchParams.get('v') || '';
  } catch {
    return '';
  }
}

function loadImage(url) {
  mediaLayer.innerHTML = '';
  const image = document.createElement('img');
  image.alt = title;
  image.src = url;
  image.onload = () => showAction('Apunta al marcador INTER SG para ver la imagen.');
  image.onerror = () => showError('La imagen no se pudo cargar. Verifica permisos de Blackboard y que el enlace sea directo.');
  mediaLayer.appendChild(image);
}

function loadVideo(url) {
  mediaLayer.innerHTML = '';
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('webkit-playsinline', 'true');
  video.preload = 'auto';
  video.onloadedmetadata = () => showAction('Apunta al marcador INTER SG para ver el video.');
  video.onerror = () => showError('El video no se pudo cargar. Verifica permisos de Blackboard y que sea MP4/WebM directo.');
  mediaLayer.appendChild(video);
  videoElement = video;
}

async function playVideoIfNeeded() {
  if (!videoElement) return;
  try {
    await videoElement.play();
    playVideoBtn.style.display = 'none';
  } catch {
    playVideoBtn.style.display = 'inline-block';
    showAction('Si el video no comienza automáticamente, toca Activar video.');
  }
}

function loadYoutube(url) {
  const id = extractYoutubeId(url);
  if (!id) {
    showError('No se pudo identificar el video de YouTube.');
    return;
  }
  mediaLayer.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${id}?playsinline=1&rel=0`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  mediaLayer.appendChild(iframe);

  youtubeBtn.href = url;
  youtubeBtn.style.display = 'inline-block';
  showAction('Apunta al marcador INTER SG para ver el video de YouTube.');
}

if (!mediaUrl) {
  showError('No hay contenido AR. Regenera el QR Code desde el generador.');
} else if (type === 'video') {
  loadVideo(mediaUrl);
} else if (type === 'youtube') {
  loadYoutube(mediaUrl);
} else {
  loadImage(mediaUrl);
}

marker.addEventListener('markerFound', () => {
  markerDetected = true;
  showMedia();
  if (type === 'video') playVideoIfNeeded();
  showAction('Marcador INTER SG detectado.');
});

marker.addEventListener('markerLost', () => {
  markerDetected = false;
  showAction('Marcador perdido. Vuelve a apuntar al marcador INTER SG o usa el botón de respaldo.');
});

manualShowBtn.addEventListener('click', () => {
  markerDetected = true;
  showMedia();
  if (type === 'video') playVideoIfNeeded();
});

playVideoBtn.addEventListener('click', playVideoIfNeeded);

zoomInBtn.addEventListener('click', () => {
  scale = Math.min(scale + 0.15, 4);
  applyScale();
});

zoomOutBtn.addEventListener('click', () => {
  scale = Math.max(scale - 0.15, 0.25);
  applyScale();
});

resetBtn.addEventListener('click', () => {
  scale = 1;
  applyScale();
});

let pinchStartDistance = null;
let pinchStartScale = 1;

function distance(t1, t2) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

document.addEventListener('touchstart', event => {
  if (event.touches.length === 2) {
    pinchStartDistance = distance(event.touches[0], event.touches[1]);
    pinchStartScale = scale;
  }
}, { passive: true });

document.addEventListener('touchmove', event => {
  if (event.touches.length === 2 && pinchStartDistance) {
    const newDistance = distance(event.touches[0], event.touches[1]);
    scale = Math.max(0.25, Math.min(4, pinchStartScale * (newDistance / pinchStartDistance)));
    applyScale();
  }
}, { passive: true });

document.addEventListener('touchend', event => {
  if (event.touches.length < 2) pinchStartDistance = null;
}, { passive: true });

// Fallback reminder
setTimeout(() => {
  if (!markerDetected) {
    showAction('Si el marcador no se detecta, verifica luz, distancia y que el marcador esté completo. También puedes usar Mostrar contenido sin marcador.');
  }
}, 8000);
