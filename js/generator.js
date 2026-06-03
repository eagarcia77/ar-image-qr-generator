const $ = id => document.getElementById(id);
const contentTypeInput = $('contentType');
const contentUrlInput = $('contentUrl');
const titleInput = $('title');
const descriptionInput = $('description');
const baseUrlInput = $('baseUrl');
const testBtn = $('testBtn');
const generateBtn = $('generateBtn');
const statusBox = $('status');
const previewWrap = $('previewWrap');
const imagePreview = $('imagePreview');
const videoPreview = $('videoPreview');
const youtubePreview = $('youtubePreview');
const youtubeThumb = $('youtubeThumb');
const youtubeLink = $('youtubeLink');
const documentPreview = $('documentPreview');
const previewOpenBtn = $('previewOpenBtn');
const resultUrl = $('resultUrl');
const oneImagePreview = $('oneImagePreview');
const downloadSingleBtn = $('downloadSingleBtn');
const openBtn = $('openBtn');

function setStatus(message, type='ok'){
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function currentBaseUrl(){
  const c = window.location.href;
  return c.substring(0, c.lastIndexOf('/') + 1);
}

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

function getYoutubeWatchUrl(url){
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url;
}

function detectType(url){
  const selected = contentTypeInput.value;
  const clean = url.split('?')[0].toLowerCase();
  if(selected !== 'auto') return selected;
  if(/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if(/\.(mp4|webm|ogg|mov|m4v)$/.test(clean)) return 'video';
  if(/\.(png|jpg|jpeg|webp|gif)$/.test(clean)) return 'image';
  if(clean.endsWith('.pdf')) return 'pdf';
  return 'link';
}

function buildArUrl(){
  const url = contentUrlInput.value.trim();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const base = (baseUrlInput.value.trim() || currentBaseUrl()).replace(/index\.html$/i, '');
  if(!url) return '';
  const type = detectType(url);
  const finalUrl = type === 'youtube' ? getYoutubeWatchUrl(url) : url;
  return `${base}viewer-ar.html?type=${encodeURIComponent(type)}&data=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;
}

function resetPreview(){
  previewWrap.classList.add('hidden');
  imagePreview.classList.add('hidden');
  videoPreview.classList.add('hidden');
  youtubePreview.classList.add('hidden');
  documentPreview.classList.add('hidden');
  imagePreview.removeAttribute('src');
  videoPreview.removeAttribute('src');
  youtubeThumb.removeAttribute('src');
  documentPreview.removeAttribute('src');
}

function testContent(){
  const url = contentUrlInput.value.trim();
  if(!url){ setStatus('Pega primero el URL del contenido.', 'error'); return; }

  resetPreview();
  previewOpenBtn.href = url;
  previewWrap.classList.remove('hidden');
  const type = detectType(url);
  setStatus('Probando contenido...', 'warn');

  if(type === 'youtube'){
    const id = extractYoutubeId(url);
    if(!id){ setStatus('No pude identificar el video de YouTube. Usa youtube.com/watch?v=, youtu.be, shorts, embed o live.', 'error'); return; }
    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    youtubeThumb.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    youtubeLink.href = watchUrl;
    previewOpenBtn.href = watchUrl;
    youtubePreview.classList.remove('hidden');
    setStatus('YouTube detectado correctamente. La experiencia tendrá botón visible para abrir YouTube.', 'ok');
    return;
  }

  if(type === 'video'){
    const tester = document.createElement('video');
    tester.muted = true;
    tester.playsInline = true;
    tester.preload = 'metadata';
    tester.onloadedmetadata = () => {
      videoPreview.src = url;
      videoPreview.classList.remove('hidden');
      setStatus('El video se cargó correctamente.', 'ok');
    };
    tester.onerror = () => setStatus('El video no se pudo validar. Aun así puedes generar el QR si tiene permisos Read.', 'warn');
    tester.src = url;
    return;
  }

  if(type === 'image'){
    const tester = new Image();
    tester.onload = () => {
      imagePreview.src = url;
      imagePreview.classList.remove('hidden');
      setStatus('La imagen se cargó correctamente. Si es PNG transparente, la transparencia se conserva.', 'ok');
    };
    tester.onerror = () => setStatus('La imagen no se pudo validar. Aun así puedes generar el QR si tiene permisos Read.', 'warn');
    tester.src = url;
    return;
  }

  documentPreview.src = url;
  documentPreview.classList.remove('hidden');
  setStatus('Vista previa cargada. Si Blackboard bloquea el PDF/enlace, use Abrir en pestaña nueva.', 'warn');
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundRect(ctx,x,y,w,h,r,fill,stroke){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
  if(fill){ctx.fillStyle=fill; ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke; ctx.lineWidth=4; ctx.stroke();}
}

function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=3){
  if(!text) return;
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for(const word of words){
    const test = line + word + ' ';
    if(ctx.measureText(test).width > maxWidth && line){
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  lines.slice(0,maxLines).forEach((ln,i)=>ctx.fillText(ln,x,y+(i*lineHeight)));
}

async function buildSingleImage(qrUrl,titleText,descriptionText,contentType){
  const qr = await loadImage(qrUrl);
  const marker = await loadImage('assets/inter-sg-marker.png');
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawRoundRect(ctx,60,60,1480,1680,44,'#ffffff','#007B5F');

  ctx.fillStyle = '#007B5F';
  ctx.font = 'bold 58px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('AR Universal INTER SG',800,140);

  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 40px Arial';
  ctx.fillText(titleText || 'Experiencia AR',800,205);

  ctx.fillStyle = '#5d716b';
  ctx.font = '28px Arial';
  ctx.fillText('Image · Video · YouTube · PDF · Link',800,255);

  ctx.drawImage(qr,200,330,1200,1200);

  // Marker smaller in the center so the QR Code can scan reliably.
  drawRoundRect(ctx,650,780,300,300,22,'#ffffff','#d7e5e0');
  ctx.drawImage(marker,670,800,260,260);

  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 25px Arial';
  ctx.fillText('QR Code + Marker INTER SG',800,1275);

  ctx.fillStyle = '#85714D';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Tipo de contenido: ${contentType}`,800,1328);

  if(descriptionText){
    ctx.fillStyle = '#14211d';
    ctx.font = '24px Arial';
    wrapText(ctx,descriptionText,800,1378,1040,30,3);
  }

  drawRoundRect(ctx,210,1530,1180,120,28,'#FFF4CC','#FED141');
  ctx.fillStyle = '#14211d';
  ctx.font = 'bold 24px Arial';
  wrapText(ctx,'Publique o imprima esta imagen. El estudiante escanea el QR y luego apunta al Marker INTER SG del centro.',800,1575,1040,30,3);

  return canvas.toDataURL('image/png');
}

async function generate(){
  const arUrl = buildArUrl();
  if(!arUrl){ setStatus('Falta el URL del contenido.', 'error'); return; }

  const type = detectType(contentUrlInput.value.trim());
  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&ecc=H&format=png&data=${encodeURIComponent(arUrl)}`;

  setStatus('Creando imagen única...', 'warn');

  try{
    const single = await buildSingleImage(qrUrl,titleInput.value.trim(),descriptionInput.value.trim(),type);
    oneImagePreview.innerHTML = `<img src="${single}" alt="QR Code con Marker INTER SG en el centro">`;
    downloadSingleBtn.href = single;
    downloadSingleBtn.download = `QR_Marker_INTER_SG_${type}.png`;
    downloadSingleBtn.classList.remove('disabled');
    setStatus('Listo. Descarga la imagen única y publícala en Blackboard.', 'ok');
  }catch(e){
    oneImagePreview.innerHTML = '<p>No se pudo crear la imagen única. Verifica conexión a internet para generar el QR.</p>';
    setStatus('No se pudo crear la imagen única.', 'error');
  }
}

baseUrlInput.value = currentBaseUrl();
testBtn.addEventListener('click', testContent);
generateBtn.addEventListener('click', generate);
