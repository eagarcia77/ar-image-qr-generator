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
const actionBox = document.getElementById('actionBox');
const overlayBox = document.querySelector('.overlay');
const manualShowBtn = document.getElementById('manualShowBtn');
const overlayMarkerLabel = document.getElementById('overlayMarkerLabel');
const playVideoBtn = document.getElementById('playVideoBtn');
const audioBtn = document.getElementById('audioBtn');
const youtubeBtn = document.getElementById('youtubeBtn');
const youtubeAudioBtn = document.getElementById('youtubeAudioBtn');
const interSgMarker = document.getElementById('interSgMarker');
const interMarker = document.getElementById('interMarker');
const hiroMarker = document.getElementById('hiroMarker');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');
const controlsBox = document.querySelector('.controls');

let scale = 1;
let markerDetected = false;
let videoElement = null;
let videoAudioEnabled = false;
let youtubeIframe = null;
let youtubeWatchUrl = '';
let youtubeEmbedUrl = '';

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


function activateYoutubePlayback(){
  const panel = document.getElementById('youtubeStartPanel');
  if(panel) panel.classList.add('hidden-panel');

  if(youtubeIframe && youtubeEmbedUrl){
    // Re-load with autoplay requested after user interaction. This is the most reliable way on phones.
    youtubeIframe.src = youtubeEmbedUrl + '&start=0';
  }

  if(youtubeAudioBtn) youtubeAudioBtn.style.display = 'none';
  showAction('YouTube reproduciéndose. Si no escuchas audio, toca dentro del video o usa Abrir video en YouTube.');
}

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

let commentHideTimer = null;

function resetCommentVisibility(){
  if(overlayBox) overlayBox.classList.remove('auto-hidden');
  if(actionBox) actionBox.classList.remove('text-hidden');
  if(controlsBox) controlsBox.classList.remove('auto-hidden');
  if(mediaLayer) mediaLayer.classList.remove('clean-view');
  if(commentHideTimer) clearTimeout(commentHideTimer);
}

function hideCommentsAfterDelay(){
  if(commentHideTimer) clearTimeout(commentHideTimer);
  commentHideTimer = setTimeout(() => {
    if(overlayBox) overlayBox.classList.add('auto-hidden');
    if(actionBox) actionBox.classList.add('text-hidden');
    if(controlsBox) controlsBox.classList.add('auto-hidden');
    if(mediaLayer && mediaLayer.style.display === 'block') mediaLayer.classList.add('clean-view');
  }, 5000);
}

function scheduleCommentFade(){
  resetCommentVisibility();
  hideCommentsAfterDelay();
}

function showInterfaceTemporarily(){
  if(mediaLayer && mediaLayer.style.display === 'block') scheduleCommentFade();
}


function activateVideoAudio(){
  if(!videoElement) return;
  videoElement.muted = false;
  videoElement.volume = 1;
  videoAudioEnabled = true;
  videoElement.play().then(() => {
    audioBtn.style.display = 'none';
    playVideoBtn.style.display = 'none';
    showAction('Audio activado. El video ya se puede escuchar.');
  }).catch(() => {
    showAction('Toca el video una vez para permitir el audio en este dispositivo.');
  });
}

function applyScale(){
  mediaLayer.classList.add('no-float');
  mediaLayer.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function showContent(){
  if(!mediaUrl){ showError('No hay contenido. Regenera el QR Code.'); return; }
  mediaLayer.style.display = 'block';
  scheduleCommentFade();

  if(type === 'youtube'){
    showAction('YouTube flotante listo. El sistema intentará reproducirlo automáticamente. Si no se escucha, toca Reproducir YouTube.');
  } else if(type === 'image'){
    showAction('Imagen 3D visible con efecto futurista. Usa + y − o pellizca con dos dedos.');
  } else if(type === 'link'){
    showAction('Página web lista. Toca Abrir página web.');
  } else if(type === 'video'){
    showAction('Video inmersivo listo. El sistema intentará reproducirlo automáticamente.');
  } else {
    showAction('Contenido visible. Usa + y − o pellizca con dos dedos.');
  }

  if(type === 'video') playVideoIfNeeded(false);
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
    const stage = document.createElement('div');
    stage.className = 'video-stage-future';
    stage.innerHTML = `
      <div class="video-glow-ring"></div>
      <div class="video-card-future">
        <div class="video-badge-row">
          <span class="video-badge">Immersive Video</span>
          <span class="audio-badge">Audio Ready</span>
        </div>
        <video class="video-player-future" src="${mediaUrl}" controls playsinline webkit-playsinline preload="auto"></video>
        <p class="video-help">El sistema intentará reproducir el video automáticamente. Si el dispositivo bloquea el audio, usa los botones <strong>Reproducir video</strong> y <strong>Activar audio</strong>.</p>
      </div>
    `;
    const video = stage.querySelector('video');
    video.muted = false;
    video.volume = 1;
    video.loop = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline','true');
    video.onerror = () => showError('El video no pudo cargar. Verifica MP4/WebM y permisos Read.');
    mediaBody.appendChild(stage);
    videoElement = video;
    return;
  }

  if(type === 'youtube'){
    const id = extractYoutubeId(mediaUrl);
    if(!id){
      showError('No se pudo identificar el video de YouTube. Verifica que el enlace sea de YouTube.');
      return;
    }

    youtubeWatchUrl = `https://www.youtube.com/watch?v=${id}`;
    youtubeEmbedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&playsinline=1&controls=1&rel=0&modestbranding=1&enablejsapi=1`;

    mediaBody.innerHTML = `
      <div class="youtube-float-stage">
        <div class="youtube-holo-glow"></div>
        <div class="youtube-player-card">
          <div class="youtube-topbar">
            <span class="youtube-live-badge">Floating YouTube</span>
            <span class="youtube-audio-badge">Autoplay + Audio</span>
          </div>
          <div class="youtube-frame-wrap">
            <iframe id="youtubeFrame" src="${youtubeEmbedUrl}" title="${title.replace(/"/g, '&quot;')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            <div id="youtubeStartPanel" class="youtube-start-panel">
              <button id="youtubeBigPlay" class="youtube-play-big" type="button">▶</button>
              <strong>Reproducir YouTube</strong>
              <span>Si el navegador bloquea el audio automático, toca este botón para iniciar el video y activar el sonido.</span>
            </div>
          </div>
          <p class="youtube-help">El video flota dentro de la experiencia AR. Algunos celulares bloquean el sonido automático; por eso se incluye el botón de reproducción.</p>
        </div>
      </div>
    `;

    youtubeIframe = document.getElementById('youtubeFrame');
    const bigPlay = document.getElementById('youtubeBigPlay');
    if(bigPlay) bigPlay.addEventListener('click', activateYoutubePlayback);

    openContentBtn.href = youtubeWatchUrl;
    openContentBtn.textContent = 'Abrir video en YouTube';
    youtubeBtn.href = youtubeWatchUrl;
    youtubeBtn.style.display = 'inline-block';
    youtubeBtn.textContent = 'Abrir video en YouTube';
    youtubeAudioBtn.style.display = 'inline-block';
    youtubeAudioBtn.textContent = '▶ Reproducir YouTube';
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

async function playVideoIfNeeded(forceAudio = false){
  if(!videoElement) return;
  try{
    if(forceAudio){
      videoElement.muted = false;
      videoElement.volume = 1;
      videoAudioEnabled = true;
    }
    await videoElement.play();
    playVideoBtn.style.display = 'none';
    if(videoElement.muted){
      audioBtn.style.display = 'inline-block';
      showAction('Video reproduciéndose. Si no escuchas audio, toca Activar audio.');
    } else {
      audioBtn.style.display = 'none';
      showAction('Video reproduciéndose con audio.');
    }
  }catch{
    try{
      videoElement.muted = true;
      await videoElement.play();
      playVideoBtn.style.display = 'inline-block';
      audioBtn.style.display = 'inline-block';
      showAction('El video comenzó en silencio. Toca Activar audio para escucharlo.');
    }catch{
      playVideoBtn.style.display = 'inline-block';
      audioBtn.style.display = 'inline-block';
      showAction('Si el video no comienza, toca Reproducir video. Luego toca Activar audio.');
    }
  }
}

configurePresentationMode();
buildContent();

activeMarker.addEventListener('markerFound', () => {
  markerDetected = true;
  resetCommentVisibility();
  showContent();
  showAction(type === 'youtube' ? `Marker ${markerLabel} detectado. YouTube flotante listo para reproducirse.` : type === 'video' ? `Marker ${markerLabel} detectado. El video se abrirá en modo inmersivo.` : `Marker ${markerLabel} detectado.`);
});

activeMarker.addEventListener('markerLost', () => {
  markerDetected = false;
  resetCommentVisibility();
  showAction(`Marker ${markerLabel} perdido. Vuelve a apuntar o usa Mostrar contenido sin marcador.`);
  hideCommentsAfterDelay();
});

manualShowBtn.addEventListener('click', () => { showContent(); if(type === 'video') playVideoIfNeeded(true); });
hideBtn.addEventListener('click', hideContent);
playVideoBtn.addEventListener('click', () => playVideoIfNeeded(true));
audioBtn.addEventListener('click', activateVideoAudio);
youtubeAudioBtn.addEventListener('click', activateYoutubePlayback);


// Si el usuario toca la pantalla, los controles aparecen otra vez por 5 segundos.
document.addEventListener('pointerdown', showInterfaceTemporarily, {passive:true});

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
  if(!markerDetected){
    resetCommentVisibility();
    showAction(`Si el Marker ${markerLabel} no se detecta, usa Mostrar contenido sin marcador.`);
    hideCommentsAfterDelay();
  }
}, 8000);
