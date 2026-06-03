const params = new URLSearchParams(window.location.search);
const mediaUrl = params.get('data') || '';
const type = params.get('type') || 'link';
const title = params.get('title') || 'Contenido AR';
const description = params.get('description') || '';

const pageTitle = document.getElementById('pageTitle');
const contentTitle = document.getElementById('contentTitle');
const contentDescription = document.getElementById('contentDescription');
const mediaLayer = document.getElementById('mediaLayer');
const mediaBody = document.getElementById('mediaBody');
const openContentBtn = document.getElementById('openContentBtn');
const hideBtn = document.getElementById('hideBtn');
const errorBox = document.getElementById('errorBox');
const actionText = document.getElementById('actionText');
const manualShowBtn = document.getElementById('manualShowBtn');
const playVideoBtn = document.getElementById('playVideoBtn');
const youtubeBtn = document.getElementById('youtubeBtn');
const marker = document.getElementById('interMarker');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');

let scale = 1;
let markerDetected = false;
let videoElement = null;

pageTitle.textContent = title;
contentTitle.textContent = title;
contentDescription.textContent = description;
openContentBtn.href = mediaUrl || '#';

function configurePresentationMode(){
  if(type === 'image'){
    mediaLayer.classList.add('transparent-mode');
  } else {
    mediaLayer.classList.remove('transparent-mode');
  }
}

function showError(message){
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function showAction(message){ actionText.textContent = message; }

function applyScale(){
  mediaLayer.classList.add('no-float');
  mediaLayer.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function showContent(){
  if(!mediaUrl){ showError('No hay contenido. Regenera el QR Code.'); return; }
  mediaLayer.style.display = 'block';
  showAction(type === 'image' ? 'Imagen visible con fondo transparente. Usa + y − o pellizca con dos dedos.' : 'Contenido visible. Usa + y − o pellizca con dos dedos.');
  if(type === 'video') playVideoIfNeeded();
}

function hideContent(){ mediaLayer.style.display = 'none'; }

function extractYoutubeId(url){
  const raw = (url || '').trim();
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if(host === 'youtu.be'){
      return u.pathname.split('/').filter(Boolean)[0] || '';
    }

    if(host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com'){
      if(u.pathname === '/watch') return u.searchParams.get('v') || '';
      if(u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || '';
      if(u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || '';
      if(u.pathname.startsWith('/live/')) return u.pathname.split('/')[2] || '';
    }
  } catch(e) {}

  const fallback = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
  return fallback ? fallback[1] : '';
}

function buildContent(){
  mediaBody.innerHTML = '';
  if(!mediaUrl){ showError('No hay contenido AR.'); return; }

  if(type === 'image'){
    const img = document.createElement('img');
    img.src = mediaUrl;
    img.alt = title;
    img.onerror = () => showError('La imagen no pudo cargar. Verifica permisos Read o URL directo.');
    mediaBody.appendChild(img);
    return;
  }

  if(type === 'video'){
    const video = document.createElement('video');
    video.src = mediaUrl;
    video.controls = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline','true');
    video.preload = 'auto';
    video.onerror = () => showError('El video no pudo cargar. Verifica MP4/WebM y permisos Read.');
    mediaBody.appendChild(video);
    videoElement = video;
    return;
  }

  if(type === 'youtube'){
    const id = extractYoutubeId(mediaUrl);
    if(!id){ showError('No se pudo identificar el video de YouTube. Abre el video con el botón Abrir contenido.'); return; }

    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    const embedUrl = `https://www.youtube.com/embed/${id}?playsinline=1&rel=0`;

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    mediaBody.appendChild(iframe);

    const note = document.createElement('p');
    note.textContent = 'Si el reproductor de YouTube no carga aquí, presiona Abrir video en YouTube.';
    note.style.fontSize = '.9rem';
    note.style.color = '#5d716b';
    mediaBody.appendChild(note);

    openContentBtn.href = watchUrl;
    openContentBtn.textContent = 'Abrir video en YouTube';
    youtubeBtn.href = watchUrl;
    youtubeBtn.style.display = 'inline-block';
    youtubeBtn.textContent = 'Abrir video en YouTube';
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = mediaUrl;
  iframe.title = title;
  mediaBody.appendChild(iframe);

  const note = document.createElement('p');
  note.textContent = type === 'pdf'
    ? 'Si el PDF no aparece aquí, presiona Abrir contenido. Blackboard puede requerir login o bloquear vista embebida.'
    : 'Si el enlace no aparece aquí, presiona Abrir contenido.';
  note.style.fontSize = '.9rem';
  note.style.color = '#5d716b';
  mediaBody.appendChild(note);
}

async function playVideoIfNeeded(){
  if(!videoElement) return;
  try{
    await videoElement.play();
    playVideoBtn.style.display = 'none';
  }catch{
    playVideoBtn.style.display = 'inline-block';
    showAction('Si el video no comienza, toca Activar video.');
  }
}

configurePresentationMode();
buildContent();

marker.addEventListener('markerFound', () => {
  markerDetected = true;
  showContent();
  showAction('Marker INTER SG detectado.');
});

marker.addEventListener('markerLost', () => {
  markerDetected = false;
  showAction('Marker perdido. Vuelve a apuntar o usa Mostrar contenido sin marcador.');
});

manualShowBtn.addEventListener('click', showContent);
hideBtn.addEventListener('click', hideContent);
playVideoBtn.addEventListener('click', playVideoIfNeeded);

zoomInBtn.addEventListener('click', () => { scale = Math.min(scale + 0.15, 2.8); applyScale(); });
zoomOutBtn.addEventListener('click', () => { scale = Math.max(scale - 0.15, 0.35); applyScale(); });
resetBtn.addEventListener('click', () => { scale = 1; applyScale(); });

let pinchStartDistance = null;
let pinchStartScale = 1;
function distance(t1, t2){
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

document.addEventListener('touchstart', (event) => {
  if(event.touches.length === 2 && mediaLayer.style.display === 'block'){
    pinchStartDistance = distance(event.touches[0], event.touches[1]);
    pinchStartScale = scale;
  }
}, {passive:true});

document.addEventListener('touchmove', (event) => {
  if(event.touches.length === 2 && pinchStartDistance && mediaLayer.style.display === 'block'){
    const newDistance = distance(event.touches[0], event.touches[1]);
    scale = Math.max(0.35, Math.min(2.8, pinchStartScale * (newDistance / pinchStartDistance)));
    applyScale();
  }
}, {passive:true});

document.addEventListener('touchend', (event) => {
  if(event.touches.length < 2) pinchStartDistance = null;
}, {passive:true});

setTimeout(() => {
  if(!markerDetected) showAction('Si el Marker no se detecta, usa Mostrar contenido sin marcador.');
}, 8000);
