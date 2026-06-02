const params = new URLSearchParams(window.location.search);
const mediaUrl = params.get('data') || params.get('img') || '';
const type = params.get('type') || 'image';
const title = params.get('title') || 'Realidad Aumentada Inter SG';

const titleText = document.getElementById('titleText');
const errorBox = document.getElementById('errorBox');
const videoHint = document.getElementById('videoHint');
const playVideoBtn = document.getElementById('playVideoBtn');
const arImage = document.getElementById('arImage');
const arVideo = document.getElementById('arVideo');
const mediaPlane = document.getElementById('mediaPlane');
const marker = document.getElementById('interMarker');

titleText.textContent = title;

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
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

async function tryPlayVideo() {
  try {
    await arVideo.play();
    videoHint.style.display = 'none';
  } catch (e) {
    videoHint.style.display = 'block';
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
    showError('La imagen no se pudo cargar. Verifica que el enlace sea directo y que tenga permisos de lectura.');
  };
  tester.src = url;
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
    showError('El video no se pudo cargar. Usa un enlace directo a un archivo MP4/WebM con permisos de lectura.');
  });

  marker.addEventListener('markerFound', tryPlayVideo);
  playVideoBtn.addEventListener('click', tryPlayVideo);
  document.body.addEventListener('touchstart', tryPlayVideo, { once: true });
}

if (!mediaUrl) {
  showError('No hay contenido AR. Regenera el QR Code desde el generador.');
} else if (type === 'video') {
  loadVideo(mediaUrl);
} else {
  loadImage(mediaUrl);
}
