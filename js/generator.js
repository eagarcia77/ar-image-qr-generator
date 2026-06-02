const mediaTypeInput = document.getElementById('mediaType');
const mediaUrlInput = document.getElementById('mediaUrl');
const titleInput = document.getElementById('title');
const baseUrlInput = document.getElementById('baseUrl');
const testBtn = document.getElementById('testBtn');
const generateBtn = document.getElementById('generateBtn');
const resultUrl = document.getElementById('resultUrl');
const openBtn = document.getElementById('openBtn');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const statusBox = document.getElementById('status');
const qrBox = document.getElementById('qrcode');
const previewWrap = document.getElementById('previewWrap');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const youtubePreview = document.getElementById('youtubePreview');
const youtubeThumb = document.getElementById('youtubeThumb');
const youtubeLink = document.getElementById('youtubeLink');

function setStatus(msg, type = 'ok') {
  statusBox.textContent = msg;
  statusBox.className = `status ${type}`;
}

function getBaseUrl() {
  const current = window.location.href;
  return current.substring(0, current.lastIndexOf('/') + 1);
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

function detectType(url) {
  const selected = mediaTypeInput.value;
  const clean = url.split('?')[0].toLowerCase();
  if (selected !== 'auto') return selected;
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(clean)) return 'video';
  return 'image';
}

function buildArUrl() {
  const mediaUrl = mediaUrlInput.value.trim();
  const title = titleInput.value.trim();
  const base = (baseUrlInput.value.trim() || getBaseUrl()).replace(/index\.html$/i, '');
  if (!mediaUrl) return '';
  const type = detectType(mediaUrl);
  return `${base}marker-ar.html?type=${encodeURIComponent(type)}&data=${encodeURIComponent(mediaUrl)}&title=${encodeURIComponent(title)}`;
}

function resetPreview() {
  previewWrap.classList.add('hidden');
  imagePreview.classList.add('hidden');
  videoPreview.classList.add('hidden');
  youtubePreview.classList.add('hidden');
  imagePreview.removeAttribute('src');
  videoPreview.removeAttribute('src');
  youtubeThumb.removeAttribute('src');
}

function testContent() {
  const url = mediaUrlInput.value.trim();
  if (!url) {
    setStatus('Pega primero el URL del contenido.', 'error');
    return;
  }

  resetPreview();
  const type = detectType(url);
  setStatus('Probando contenido...', 'warn');

  if (type === 'youtube') {
    const id = extractYoutubeId(url);
    if (!id) {
      setStatus('No pude identificar el ID del video de YouTube. Verifica el enlace.', 'error');
      return;
    }
    youtubeThumb.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    youtubeLink.href = url;
    youtubePreview.classList.remove('hidden');
    previewWrap.classList.remove('hidden');
    setStatus('Enlace de YouTube detectado. El AR mostrará la miniatura y un botón para abrir el video.', 'ok');
    return;
  }

  if (type === 'video') {
    const tester = document.createElement('video');
    tester.muted = true;
    tester.playsInline = true;
    tester.preload = 'metadata';
    tester.onloadedmetadata = () => {
      videoPreview.src = url;
      videoPreview.classList.remove('hidden');
      previewWrap.classList.remove('hidden');
      setStatus('El video se cargó correctamente. Ya puedes generar el QR.', 'ok');
    };
    tester.onerror = () => {
      setStatus('El video no se pudo validar. Aun así puedes generar el QR si el enlace tiene permisos y es directo.', 'warn');
    };
    tester.src = url;
    return;
  }

  const tester = new Image();
  tester.onload = () => {
    imagePreview.src = url;
    imagePreview.classList.remove('hidden');
    previewWrap.classList.remove('hidden');
    setStatus('La imagen se cargó correctamente. Ya puedes generar el QR.', 'ok');
  };
  tester.onerror = () => {
    setStatus('La imagen no se pudo validar. Aun así puedes generar el QR si el enlace tiene permisos para estudiantes.', 'warn');
  };
  tester.src = url;
}

function generateQR() {
  const arUrl = buildArUrl();
  if (!arUrl) {
    setStatus('Falta el URL del contenido. Pega un enlace antes de generar el QR.', 'error');
    return;
  }

  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');
  openBtn.setAttribute('aria-disabled', 'false');

  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&format=png&data=${encodeURIComponent(arUrl)}`;
  qrBox.innerHTML = `<img id="qrImage" src="${qrApi}" alt="QR Code generado para la experiencia AR">`;
  downloadQrBtn.href = qrApi;
  downloadQrBtn.classList.remove('disabled');
  downloadQrBtn.setAttribute('aria-disabled', 'false');

  const safeTitle = (titleInput.value.trim() || 'Experiencia_AR').replace(/[^\w\-]+/g, '_');
  downloadQrBtn.download = `QR_${safeTitle}.png`;

  setStatus('QR Code generado. Descarga el QR Code y el marcador Inter SG para publicarlos en Blackboard.', 'ok');
}

baseUrlInput.value = getBaseUrl();
testBtn.addEventListener('click', testContent);
generateBtn.addEventListener('click', generateQR);
