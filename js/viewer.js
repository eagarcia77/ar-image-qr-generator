const params = new URLSearchParams(window.location.search);
const video = document.getElementById('cameraView');
const fallback = document.getElementById('fallback');
const arImage = document.getElementById('arImage');
const titleEl = document.getElementById('title');
const instructionsEl = document.getElementById('instructions');
const startCamera = document.getElementById('startCamera');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const reset = document.getElementById('reset');
const openOriginal = document.getElementById('openOriginal');

let scale = 1;
let pos = { x: 0, y: 0 };
let dragging = false;
let start = { x: 0, y: 0 };

function decodePayload(value) {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(Array.prototype.map.call(atob(base64), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getContent() {
  const data = params.get('data');
  if (data) return decodePayload(data);
  const oldImg = params.get('img');
  if (oldImg) {
    return {
      img: oldImg,
      title: params.get('title') || 'Imagen en Realidad Aumentada',
      instructions: params.get('instructions') || 'Permite el uso de cámara y observa la imagen.'
    };
  }
  return null;
}

function showError(title, message) {
  fallback.classList.remove('hidden');
  fallback.innerHTML = `<div class="error-card"><h1>${title}</h1><p>${message}</p></div>`;
  arImage.hidden = true;
}

function updateTransform() {
  arImage.style.transform = `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) rotateX(10deg) scale(${scale})`;
}

async function enableCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = stream;
    fallback.classList.add('hidden');
    startCamera.textContent = 'Cámara activa';
  } catch (error) {
    showError('No se pudo activar la cámara', 'Verifica los permisos del navegador. La página debe abrirse por HTTPS y el celular debe permitir acceso a la cámara.');
  }
}

function loadContent() {
  const content = getContent();
  if (!content || !content.img) {
    showError('No hay contenido AR', 'El QR no contiene una imagen válida. Vuelve al generador y crea el QR nuevamente con la versión corregida.');
    return;
  }

  titleEl.textContent = content.title || 'Imagen en Realidad Aumentada';
  instructionsEl.textContent = content.instructions || 'Permite el uso de cámara y observa la imagen.';
  openOriginal.href = content.img;
  arImage.onload = () => {
    arImage.hidden = false;
    fallback.classList.add('hidden');
  };
  arImage.onerror = () => {
    showError('La imagen no se pudo cargar', 'El enlace puede requerir login de Blackboard, puede estar vencido o no es un enlace directo a imagen. Abre el enlace original para verificar permisos.');
  };
  arImage.src = content.img;
}

startCamera.addEventListener('click', enableCamera);
zoomIn.addEventListener('click', () => { scale = Math.min(1.8, scale + 0.12); updateTransform(); });
zoomOut.addEventListener('click', () => { scale = Math.max(0.5, scale - 0.12); updateTransform(); });
reset.addEventListener('click', () => { scale = 1; pos = { x: 0, y: 0 }; updateTransform(); });

arImage.addEventListener('pointerdown', event => {
  dragging = true;
  arImage.setPointerCapture(event.pointerId);
  start = { x: event.clientX - pos.x, y: event.clientY - pos.y };
});
arImage.addEventListener('pointermove', event => {
  if (!dragging) return;
  pos = { x: event.clientX - start.x, y: event.clientY - start.y };
  updateTransform();
});
arImage.addEventListener('pointerup', () => { dragging = false; });
arImage.addEventListener('pointercancel', () => { dragging = false; });

loadContent();
updateTransform();
