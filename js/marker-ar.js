const params = new URLSearchParams(window.location.search);
const mediaUrl = params.get('data') || params.get('img') || '';
const type = params.get('type') || 'image';
const title = params.get('title') || 'Realidad Aumentada INTER SG';

const titleText = document.getElementById('titleText');
const errorBox = document.getElementById('errorBox');
const actionBox = document.getElementById('actionBox');
const actionText = document.getElementById('actionText');
const playVideoBtn = document.getElementById('playVideoBtn');
const youtubeBtn = document.getElementById('youtubeBtn');
const arImage = document.getElementById('arImage');
const arVideo = document.getElementById('arVideo');
const mediaPlane = document.getElementById('mediaPlane');
const marker = document.getElementById('interMarker');
const markerStatus = document.getElementById('markerStatus');
let markerWasFound = false;

titleText.textContent = title;

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}
function showAction(msg) {
  actionText.textContent = msg;
  actionBox.style.display = 'block';
}
function setPlaneRatio(width, height) {
  const ratio = width / height || 1;
  let planeWidth = 1.45;
  let planeHeight = planeWidth / ratio;
  if (planeHeight > 1.65) {
    planeHeight = 1.65;
    planeWidth = planeHeight * ratio;
  }
  mediaPlane.setAttribute('width', planeWidth.toFixed(3));
  mediaPlane.setAttribute('height', planeHeight.toFixed(3));
}
function extractYoutubeId(url) {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  try {
    const u = new URL(url);
    return u.searchParams.get('v') || '';
  } catch {
    return '';
  }
}
function loadImage(url) {
  const tester = new Image();
  tester.onload = () => {
    arImage.setAttribute('src', url);
    mediaPlane.setAttribute('src', '#arImage');
    setPlaneRatio(tester.width, tester.height);
  };
  tester.onerror = () => {
    showError('La imagen no se pudo cargar. Verifica que el enlace sea directo y tenga permisos de lectura.');
  };
  tester.src = url;
}
async function tryPlayVideo() {
  try {
    await arVideo.play();
    playVideoBtn.style.display = 'none';
    actionBox.style.display = 'none';
  } catch (e) {
    showAction('Si el video no comienza automáticamente, toca el botón.');
    playVideoBtn.style.display = 'inline-block';
  }
}
function loadVideo(url) {
  arVideo.src = url;
  arVideo.load();
  arVideo.addEventListener('loadedmetadata', () => {
    mediaPlane.setAttribute('src', '#arVideo');
    setPlaneRatio(arVideo.videoWidth || 16, arVideo.videoHeight || 9);
    tryPlayVideo();
  });
  arVideo.addEventListener('error', () => {
    showError('El video no se pudo cargar. Usa un enlace directo MP4/WebM con permisos de lectura.');
  });
  marker.addEventListener('markerFound', tryPlayVideo);
  playVideoBtn.addEventListener('click', tryPlayVideo);
  document.body.addEventListener('touchstart', tryPlayVideo, { once: true });
}
function loadYoutube(url) {
  const id = extractYoutubeId(url);
  if (!id) {
    showError('No se pudo identificar el video de YouTube.');
    return;
  }
  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  youtubeBtn.href = url;
  youtubeBtn.style.display = 'inline-block';
  showAction('YouTube no se reproduce como textura AR directa. Se muestra la miniatura y puedes abrir el video con este botón.');
  loadImage(thumb);
}

marker.addEventListener('markerFound', () => {
  markerWasFound = true;
  if (markerStatus) markerStatus.style.display = 'block';
});
marker.addEventListener('markerLost', () => {
  if (markerStatus) markerStatus.style.display = 'none';
});
setTimeout(() => {
  if (!markerWasFound) {
    showAction('No se ha detectado el marcador. Verifica que sea el nuevo marcador INTER SG completo, con buen brillo y sin recortar.');
  }
}, 9000);

if (!mediaUrl) {
  showError('No hay contenido AR. Regenera el QR Code desde el generador.');
} else if (type === 'video') {
  loadVideo(mediaUrl);
} else if (type === 'youtube') {
  loadYoutube(mediaUrl);
} else {
  loadImage(mediaUrl);
}
