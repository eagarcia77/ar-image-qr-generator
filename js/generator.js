const mediaTypeInput = document.getElementById('mediaType');
const mediaUrlInput = document.getElementById('mediaUrl');
const titleInput = document.getElementById('title');
const baseUrlInput = document.getElementById('baseUrl');
const testBtn = document.getElementById('testBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const resultUrl = document.getElementById('resultUrl');
const openBtn = document.getElementById('openBtn');
const statusBox = document.getElementById('status');
const qrBox = document.getElementById('qrcode');
const previewWrap = document.getElementById('previewWrap');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');

function setStatus(msg, ok = true) {
  statusBox.textContent = msg;
  statusBox.className = `status ${ok ? 'ok' : 'error'}`;
}

function getBaseUrl() {
  const current = window.location.href;
  return current.substring(0, current.lastIndexOf('/') + 1);
}

function detectType(url) {
  const clean = url.split('?')[0].toLowerCase();
  if (mediaTypeInput.value !== 'auto') return mediaTypeInput.value;
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(clean)) return 'video';
  return 'image';
}

function buildArUrl() {
  const mediaUrl = mediaUrlInput.value.trim();
  const title = titleInput.value.trim();
  const base = (baseUrlInput.value.trim() || getBaseUrl()).replace(/index\.html$/i, '');
  const type = detectType(mediaUrl);
  if (!mediaUrl) return '';
  return `${base}marker-ar.html?type=${encodeURIComponent(type)}&data=${encodeURIComponent(mediaUrl)}&title=${encodeURIComponent(title)}`;
}

function resetPreview() {
  previewWrap.classList.add('hidden');
  imagePreview.classList.add('hidden');
  videoPreview.classList.add('hidden');
  imagePreview.removeAttribute('src');
  videoPreview.removeAttribute('src');
}

function testContent() {
  const url = mediaUrlInput.value.trim();
  if (!url) {
    setStatus('Pega primero el URL directo del contenido.', false);
    return;
  }

  resetPreview();
  const type = detectType(url);
  setStatus(type === 'video' ? 'Probando video...' : 'Probando imagen...');

  if (type === 'video') {
    const tester = document.createElement('video');
    tester.muted = true;
    tester.playsInline = true;
    tester.preload = 'metadata';
    tester.onloadedmetadata = () => {
      videoPreview.src = url;
      videoPreview.classList.remove('hidden');
      previewWrap.classList.remove('hidden');
      setStatus('El video se cargó correctamente. Ya puedes generar el QR.');
    };
    tester.onerror = () => {
      setStatus('El video no se pudo cargar. Verifica que sea un enlace directo, preferiblemente .mp4, y que tenga permisos de lectura.', false);
    };
    tester.src = url;
  } else {
    const tester = new Image();
    tester.onload = () => {
      imagePreview.src = url;
      imagePreview.classList.remove('hidden');
      previewWrap.classList.remove('hidden');
      setStatus('La imagen se cargó correctamente. Ya puedes generar el QR.');
    };
    tester.onerror = () => {
      setStatus('La imagen no se pudo cargar. Verifica que sea un enlace directo y que tenga permisos de lectura.', false);
    };
    tester.src = url;
  }
}

function resetQR() {
  qrBox.innerHTML = '';
  downloadQrBtn.disabled = true;
}

function generateQR() {
  const arUrl = buildArUrl();
  if (!arUrl) {
    setStatus('Falta el URL directo del contenido.', false);
    return;
  }
  resetQR();
  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');
  openBtn.setAttribute('aria-disabled', 'false');

  new QRCode(qrBox, {
    text: arUrl,
    width: 260,
    height: 260,
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    downloadQrBtn.disabled = false;
  }, 250);

  setStatus('QR Code generado. Descarga el QR Code y el marcador Inter SG para publicarlos en Blackboard.');
}

function downloadQRCode() {
  const canvas = qrBox.querySelector('canvas');
  const img = qrBox.querySelector('img');
  let dataUrl = '';

  if (canvas) dataUrl = canvas.toDataURL('image/png');
  else if (img) dataUrl = img.src;

  if (!dataUrl) {
    setStatus('No se encontró el QR Code para descargar. Vuelve a generarlo.', false);
    return;
  }

  const safeTitle = (titleInput.value.trim() || 'Experiencia_AR').replace(/[^\w\-]+/g, '_');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `QR_${safeTitle}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setStatus('QR Code descargado. Recuerda descargar también el marcador Inter SG.');
}

baseUrlInput.value = getBaseUrl();

testBtn.addEventListener('click', testContent);
generateBtn.addEventListener('click', generateQR);
downloadQrBtn.addEventListener('click', downloadQRCode);
