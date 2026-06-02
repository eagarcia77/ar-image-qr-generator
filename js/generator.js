const form = document.getElementById('generatorForm');
const imageUrl = document.getElementById('imageUrl');
const title = document.getElementById('title');
const instructions = document.getElementById('instructions');
const viewerBase = document.getElementById('viewerBase');
const statusBox = document.getElementById('status');
const previewImage = document.getElementById('previewImage');
const shareLink = document.getElementById('shareLink');
const qrBox = document.getElementById('qrBox');
const copyLink = document.getElementById('copyLink');
const openViewer = document.getElementById('openViewer');
const testImage = document.getElementById('testImage');

viewerBase.value = new URL('viewer.html', window.location.href).href;

function setStatus(message, type = '') {
  statusBox.className = `status ${type}`.trim();
  statusBox.innerHTML = message;
}

function normalizeUrl(value) {
  return value.trim().replace(/&amp;/g, '&');
}

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  const utf8 = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1));
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function buildShareUrl() {
  const img = normalizeUrl(imageUrl.value);
  const payload = {
    img,
    title: title.value.trim() || 'Imagen en Realidad Aumentada',
    instructions: instructions.value.trim() || 'Permite el uso de cámara y observa la imagen.'
  };
  const encoded = encodePayload(payload);
  const base = viewerBase.value.trim() || new URL('viewer.html', window.location.href).href;
  const url = new URL(base);
  url.search = '';
  url.searchParams.set('data', encoded);
  return url.href;
}

function createQr(url) {
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=' + encodeURIComponent(url);
  qrBox.innerHTML = `<img src="${qrUrl}" alt="QR Code de la experiencia AR"><p class="hint">Escanea este QR con el celular.</p>`;
}

function testImageLoad(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('La imagen no pudo cargar.'));
    img.referrerPolicy = 'no-referrer-when-downgrade';
    img.src = url;
  });
}

async function validateImage() {
  const imgUrl = normalizeUrl(imageUrl.value);
  if (!imgUrl) {
    setStatus('Pega primero el URL de la imagen.', 'bad');
    return false;
  }
  try {
    new URL(imgUrl);
  } catch {
    setStatus('El texto pegado no parece ser un URL válido.', 'bad');
    return false;
  }

  setStatus('Probando si la imagen carga correctamente...', '');
  try {
    await testImageLoad(imgUrl);
    previewImage.src = imgUrl;
    previewImage.hidden = false;
    setStatus('La imagen cargó correctamente. Ya puedes generar el QR Code.', 'ok');
    return true;
  } catch {
    previewImage.hidden = true;
    setStatus('No se pudo cargar la imagen. Revisa que sea un enlace directo a imagen y que el estudiante tenga permiso para verla en Blackboard.', 'bad');
    return false;
  }
}

testImage.addEventListener('click', validateImage);

form.addEventListener('submit', async event => {
  event.preventDefault();
  const ok = await validateImage();
  if (!ok) return;
  const url = buildShareUrl();
  shareLink.value = url;
  openViewer.href = url;
  createQr(url);
  setStatus('QR Code generado. Copia el enlace o comparte el QR en Blackboard Ultra.', 'ok');
});

copyLink.addEventListener('click', async () => {
  if (!shareLink.value) {
    setStatus('Primero genera el enlace AR.', 'bad');
    return;
  }
  await navigator.clipboard.writeText(shareLink.value);
  setStatus('Enlace copiado al portapapeles.', 'ok');
});
