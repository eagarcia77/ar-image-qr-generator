
const $ = id => document.getElementById(id);
const mediaTypeInput = $('mediaType');
const mediaUrlInput = $('mediaUrl');
const titleInput = $('title');
const baseUrlInput = $('baseUrl');
const testBtn = $('testBtn');
const generateBtn = $('generateBtn');
const resultUrl = $('resultUrl');
const openBtn = $('openBtn');
const downloadQrBtn = $('downloadQrBtn');
const downloadHybridBtn = $('downloadHybridBtn');
const statusBox = $('status');
const qrBox = $('qrcode');
const hybridCardPreview = $('hybridCardPreview');
const previewWrap = $('previewWrap');
const imagePreview = $('imagePreview');
const videoPreview = $('videoPreview');
const youtubePreview = $('youtubePreview');
const youtubeThumb = $('youtubeThumb');
const youtubeLink = $('youtubeLink');

function setStatus(message, type = 'ok') {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function currentBaseUrl() {
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
    const match = url.match(p);
    if (match) return match[1];
  }
  try {
    return new URL(url).searchParams.get('v') || '';
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
  const base = (baseUrlInput.value.trim() || currentBaseUrl()).replace(/index\.html$/i, '');
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
    setStatus('YouTube detectado. Se mostrará la miniatura y un botón para abrir el video.', 'ok');
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
      setStatus('El video se cargó correctamente.', 'ok');
    };
    tester.onerror = () => {
      setStatus('El video no se pudo validar. Aun así puedes generar el QR si el enlace tiene permisos de lectura para estudiantes.', 'warn');
    };
    tester.src = url;
    return;
  }

  const tester = new Image();
  tester.onload = () => {
    imagePreview.src = url;
    imagePreview.classList.remove('hidden');
    previewWrap.classList.remove('hidden');
    setStatus('La imagen se cargó correctamente. Si es PNG transparente, la transparencia se conserva.', 'ok');
  };
  tester.onerror = () => {
    setStatus('La imagen no se pudo validar. Aun así puedes generar el QR si el enlace tiene permisos de lectura para estudiantes.', 'warn');
  };
  tester.src = url;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 4; ctx.stroke(); }
}

async function buildHybridCard(qrUrl, titleText) {
  const qrImage = await loadImage(qrUrl);
  const markerImage = await loadImage('assets/inter-sg-marker.png');

  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f4f8f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawRoundRect(ctx, 55, 55, 1490, 890, 42, '#ffffff', '#007B5F');

  ctx.fillStyle = '#007B5F';
  ctx.font = 'bold 58px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Realidad Aumentada INTER SG', 800, 135);

  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 42px Arial';
  ctx.fillText(titleText || 'Experiencia AR', 800, 200);

  ctx.fillStyle = '#5d716b';
  ctx.font = '28px Arial';
  ctx.fillText('1. Escanea el QR   2. Permite la cámara   3. Apunta al marcador INTER SG', 800, 255);

  drawRoundRect(ctx, 120, 310, 610, 545, 28, '#ffffff', '#d7e5e0');
  ctx.fillStyle = '#007B5F';
  ctx.font = 'bold 36px Arial';
  ctx.fillText('QR CODE', 425, 365);
  ctx.drawImage(qrImage, 245, 400, 360, 360);
  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Abre la experiencia AR', 425, 810);

  drawRoundRect(ctx, 870, 310, 610, 545, 28, '#ffffff', '#d7e5e0');
  ctx.fillStyle = '#85714D';
  ctx.font = 'bold 36px Arial';
  ctx.fillText('MARCADOR INTER SG', 1175, 365);
  ctx.drawImage(markerImage, 1000, 395, 350, 350);
  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Activa el contenido aumentado', 1175, 810);

  drawRoundRect(ctx, 340, 880, 920, 60, 30, '#FED141', null);
  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Publica esta tarjeta en Blackboard', 800, 919);

  return canvas.toDataURL('image/png');
}

async function generateQR() {
  const arUrl = buildArUrl();
  if (!arUrl) {
    setStatus('Falta el URL del contenido.', 'error');
    return;
  }

  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');
  openBtn.setAttribute('aria-disabled', 'false');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&format=png&data=${encodeURIComponent(arUrl)}`;
  qrBox.innerHTML = `<img crossorigin="anonymous" src="${qrUrl}" alt="QR Code generado">`;

  downloadQrBtn.href = qrUrl;
  downloadQrBtn.classList.remove('disabled');
  downloadQrBtn.setAttribute('aria-disabled', 'false');

  setStatus('QR creado. Preparando tarjeta híbrida...', 'warn');

  try {
    const hybridDataUrl = await buildHybridCard(qrUrl, titleInput.value.trim());
    hybridCardPreview.innerHTML = `<img src="${hybridDataUrl}" alt="Tarjeta híbrida QR y marcador INTER SG">`;
    downloadHybridBtn.href = hybridDataUrl;
    downloadHybridBtn.classList.remove('disabled');
    downloadHybridBtn.setAttribute('aria-disabled', 'false');
    setStatus('Listo. Descarga la tarjeta híbrida y publícala en Blackboard.', 'ok');
  } catch (error) {
    hybridCardPreview.innerHTML = '<p>El QR fue creado, pero el navegador bloqueó la creación automática de la tarjeta híbrida. Descarga el QR y el marcador por separado.</p>';
    setStatus('QR creado. Si la tarjeta híbrida no aparece, descarga el QR y el marcador por separado.', 'warn');
  }
}

baseUrlInput.value = currentBaseUrl();
testBtn.addEventListener('click', testContent);
generateBtn.addEventListener('click', generateQR);
