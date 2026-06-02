const imageUrlInput = document.getElementById('imageUrl');
const titleInput = document.getElementById('title');
const baseUrlInput = document.getElementById('baseUrl');
const testBtn = document.getElementById('testBtn');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const resultUrl = document.getElementById('resultUrl');
const openBtn = document.getElementById('openBtn');
const statusBox = document.getElementById('status');
const preview = document.getElementById('preview');
const qrBox = document.getElementById('qrcode');

let qr;

function setStatus(msg, ok = true) {
  statusBox.textContent = msg;
  statusBox.className = `status ${ok ? 'ok' : 'error'}`;
}

function getBaseUrl() {
  const current = window.location.href;
  const base = current.substring(0, current.lastIndexOf('/') + 1);
  return base;
}

baseUrlInput.value = getBaseUrl();

function buildArUrl() {
  const img = imageUrlInput.value.trim();
  const title = titleInput.value.trim();
  const base = (baseUrlInput.value.trim() || getBaseUrl()).replace(/index\.html$/i, '');
  if (!img) return '';
  return `${base}marker-ar.html?data=${encodeURIComponent(img)}&title=${encodeURIComponent(title)}`;
}

function resetQR() {
  qrBox.innerHTML = '';
  qr = null;
}

function testImage() {
  const img = imageUrlInput.value.trim();
  if (!img) {
    setStatus('Pega primero el URL de la imagen.', false);
    return;
  }
  preview.classList.add('hidden');
  setStatus('Probando imagen...');
  const tester = new Image();
  tester.onload = () => {
    preview.src = img;
    preview.classList.remove('hidden');
    setStatus('La imagen se cargó correctamente. Ya puedes generar el QR.');
  };
  tester.onerror = () => {
    setStatus('La imagen no se pudo cargar. Verifica si el enlace requiere login o no es un archivo directo.', false);
  };
  tester.src = img;
}

function generateQR() {
  const arUrl = buildArUrl();
  if (!arUrl) {
    setStatus('Falta el URL de la imagen.', false);
    return;
  }
  resetQR();
  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');
  qr = new QRCode(qrBox, {
    text: arUrl,
    width: 260,
    height: 260,
    correctLevel: QRCode.CorrectLevel.H
  });
  setStatus('QR generado. Al escanearlo se abrirá la cámara automáticamente en la página AR.');
}

function copyLink() {
  if (!resultUrl.value) {
    setStatus('Primero genera el QR.', false);
    return;
  }
  navigator.clipboard.writeText(resultUrl.value)
    .then(() => setStatus('Enlace copiado al portapapeles.'))
    .catch(() => setStatus('No se pudo copiar automáticamente. Copia el enlace manualmente.', false));
}

testBtn.addEventListener('click', testImage);
generateBtn.addEventListener('click', generateQR);
copyBtn.addEventListener('click', copyLink);
