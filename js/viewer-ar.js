const params = new URLSearchParams(window.location.search);
const mediaUrl = params.get('data') || params.get('u') || '';
const type = params.get('type') || params.get('t') || 'link';
const title = params.get('title') || params.get('n') || 'Contenido AR';
const description = params.get('description') || params.get('x') || '';
const markerMode = params.get('m') || 'intersg';

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
const overlayMarkerLabel = document.getElementById('overlayMarkerLabel');
const playVideoBtn = document.getElementById('playVideoBtn');
const youtubeBtn = document.getElementById('youtubeBtn');
const interSgMarker = document.getElementById('interSgMarker');
const interMarker = document.getElementById('interMarker');
const hiroMarker = document.getElementById('hiroMarker');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');

let scale = 1;
let markerDetected = false;
let videoElement = null;

function getMarkerLabel(){
  if(markerMode === 'hiro') return 'HIRO';
  if(markerMode === 'inter') return 'INTER';
  return 'INTER SG';
}

const markerLabel = getMarkerLabel();
const activeMarker = markerMode === 'hiro' ? hiroMarker : (markerMode === 'inter' ? interMarker : interSgMarker);
[interSgMarker, interMarker, hiroMarker].forEach(m => {
  if(m && m !== activeMarker) m.setAttribute('visible', 'false');
});

pageTitle.textContent = title;
contentTitle.textContent = title;
contentDescription.textContent = description;
openContentBtn.href = mediaUrl || '#';
if(overlayMarkerLabel) overlayMarkerLabel.textContent = `Apunta al Marker ${markerLabel}.`;
actionText.textContent = `Buscando Marker ${markerLabel}...`;

function configurePresentationMode(){
  if(type === 'image'){
    mediaLayer.classList.add('transparent-mode');
    mediaLayer.classList.add('image-3d-mode');
  } else {
    mediaLayer.classList.remove('transparent-mode');
    mediaLayer.classList.remove('image-3d-mode');
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

  if(type === 'youtube'){
    showAction('YouTube listo. Toca Abrir video en YouTube.');
  } else if(type === 'image'){
    showAction('Imagen 3D visible con efecto futurista. Usa + y − o pellizca con dos dedos.');
  } else if(type === 'link'){
    showAction('Página web lista. Toca Abrir página web.');
  } else {
    showAction('Contenido visible. Usa + y − o pellizca con dos dedos.');
  }

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
    const stage = document.createElement('div');
    stage.className = 'ar-stage-3d';
    stage.innerHTML = `
      <div class="ar-depth-shadow"></div>
      <div class="ar-glow-ring"></div>
      <div class="ar-frame-3d">
        <div class="ar-frame-inner">
          <span class="ar-tech-badge">3D Future View</span>
          <img class="ar-image-3d" src="${mediaUrl}" alt="${title.replace(/"/g, '&quot;')}">
        </div>
      </div>
    `;
    const img = stage.querySelector('img');
    img.onerror = () => showError('La imagen no pudo cargar. Verifica permisos Read o URL directo.');
    mediaBody.appendChild(stage);
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
    if(!id){
      showError('No se pudo identificar el video de YouTube. Verifica que el enlace sea de YouTube.');
      return;
    }

    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    mediaBody.innerHTML = `
      <div class="youtube-card">
        <img src="${thumbnailUrl}" alt="Miniatura del video de YouTube">
        <a class="yt-button" href="${watchUrl}" target="_blank" rel="noopener">Abrir video en YouTube</a>
        <p>YouTube puede bloquear la reproducción embebida dentro de experiencias AR. Este botón abre el video directamente en YouTube o en la app del dispositivo.</p>
      </div>
    `;

    openContentBtn.href = watchUrl;
    openContentBtn.textContent = 'Abrir video en YouTube';
    youtubeBtn.href = watchUrl;
    youtubeBtn.style.display = 'inline-block';
    youtubeBtn.textContent = 'Abrir video en YouTube';
    return;
  }

  if(type === 'pdf'){
    const iframe = document.createElement('iframe');
    iframe.src = mediaUrl;
    iframe.title = title;
    mediaBody.appendChild(iframe);

    const note = document.createElement('p');
    note.textContent = 'Si el PDF no aparece aquí, presiona Abrir contenido. Blackboard puede requerir login o bloquear vista embebida.';
    note.style.fontSize = '.9rem';
    note.style.color = '#5d716b';
    mediaBody.appendChild(note);
    return;
  }

  mediaBody.innerHTML = `
    <div class="link-card">
      <div class="link-icon">↗</div>
      <a class="link-button" href="${mediaUrl}" target="_blank" rel="noopener">Abrir página web</a>
      <p>Muchas páginas web no permiten mostrarse dentro de un panel AR. Este botón abre la página directamente en el navegador.</p>
      <p><strong>URL:</strong> ${mediaUrl}</p>
    </div>
  `;
  openContentBtn.href = mediaUrl;
  openContentBtn.textContent = 'Abrir página web';
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

activeMarker.addEventListener('markerFound', () => {
  markerDetected = true;
  showContent();
  showAction(type === 'youtube' ? `Marker ${markerLabel} detectado. Toca Abrir video en YouTube.` : `Marker ${markerLabel} detectado.`);
});

activeMarker.addEventListener('markerLost', () => {
  markerDetected = false;
  showAction(`Marker ${markerLabel} perdido. Vuelve a apuntar o usa Mostrar contenido sin marcador.`);
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
  if(!markerDetected) showAction(`Si el Marker ${markerLabel} no se detecta, usa Mostrar contenido sin marcador.`);
}, 8000);
