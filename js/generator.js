
const $ = id => document.getElementById(id);
const contentTypeInput = $('contentType');
const contentUrlInput = $('contentUrl');
const titleInput = $('title');
const descriptionInput = $('description');
const baseUrlInput = $('baseUrl');
const qrStyleInput = $('qrStyle');
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
const integratedPreview = $('integratedPreview');
const separatedPreview = $('separatedPreview');
const downloadIntegratedBtn = $('downloadIntegratedBtn');
const downloadSeparatedBtn = $('downloadSeparatedBtn');
const openBtn = $('openBtn');
const qrRenderHost = $('qrRenderHost');

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
    if(host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || '';
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
  // Shorter URL to keep QR simpler: v.html + short parameter names.
  const params = new URLSearchParams();
  params.set('t', type);
  params.set('u', finalUrl);
  if(title) params.set('n', title);
  if(description) params.set('x', description);
  return `${base}v.html?${params.toString()}`;
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

function dataUrlFromBlob(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function createQrDataUrl(data, style='classic', simple=false){
  const ecc = simple ? 'M' : 'H';
  if(style === 'modern' && window.QRCodeStyling){
    try{
      qrRenderHost.innerHTML = '';
      const qr = new QRCodeStyling({
        width: 1200,
        height: 1200,
        type: 'canvas',
        data,
        margin: simple ? 8 : 0,
        qrOptions: { errorCorrectionLevel: ecc },
        dotsOptions: simple
          ? { color: '#111111', type: 'square' }
          : { color: '#14211d', type: 'rounded' },
        backgroundOptions: { color: '#ffffff' },
        cornersSquareOptions: simple
          ? { color: '#007B5F', type: 'square' }
          : { color: '#007B5F', type: 'extra-rounded' },
        cornersDotOptions: simple
          ? { color: '#007B5F', type: 'square' }
          : { color: '#FED141', type: 'dot' }
      });
      qr.append(qrRenderHost);
      await new Promise(r => setTimeout(r, 120));
      const canvas = qrRenderHost.querySelector('canvas');
      if(canvas) return canvas.toDataURL('image/png');
      if(typeof qr.getRawData === 'function'){
        const blob = await qr.getRawData('png');
        return await dataUrlFromBlob(blob);
      }
    }catch(e){
      console.warn('Modern QR fallback', e);
    }
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&ecc=${ecc}&format=png&data=${encodeURIComponent(data)}`;
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

function getTheme(style){
  return style === 'modern'
    ? {accent:'#007B5F', accent2:'#FED141', text:'#14211d', sub:'#5d716b', bg:'#ffffff', chip:'#eef7f3'}
    : {accent:'#007B5F', accent2:'#FED141', text:'#14211d', sub:'#5d716b', bg:'#ffffff', chip:'#f4f4f4'};
}

async function buildIntegratedImage(qrDataUrl,titleText,descriptionText,contentType,style){
  const qr = await loadImage(qrDataUrl);
  const marker = await loadImage('assets/inter-sg-marker.png');
  const theme = getTheme(style);
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawRoundRect(ctx,60,60,1480,1680,44,'#ffffff',theme.accent);

  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 58px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('AR Universal INTER SG',800,140);

  ctx.fillStyle = theme.text;
  ctx.font = 'bold 40px Arial';
  ctx.fillText(titleText || 'Experiencia AR',800,205);

  ctx.fillStyle = theme.sub;
  ctx.font = '28px Arial';
  ctx.fillText(style === 'modern' ? 'Image · Video · YouTube · PDF · Link · Modern QR' : 'Image · Video · YouTube · PDF · Link',800,255);

  ctx.drawImage(qr,200,330,1200,1200);
  drawRoundRect(ctx,650,780,300,300,22,'#ffffff','#d7e5e0');
  ctx.drawImage(marker,670,800,260,260);

  ctx.fillStyle = theme.text;
  ctx.font = 'bold 25px Arial';
  ctx.fillText('QR Code + Marker INTER SG integrado',800,1275);

  ctx.fillStyle = '#85714D';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Tipo de contenido: ${contentType}`,800,1328);

  if(descriptionText){
    ctx.fillStyle = theme.text;
    ctx.font = '24px Arial';
    wrapText(ctx,descriptionText,800,1378,1040,30,3);
  }

  drawRoundRect(ctx,210,1530,1180,120,28,'#FFF4CC',theme.accent2);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 24px Arial';
  wrapText(ctx,'Escanea el QR y luego apunta al Marker INTER SG del centro. Esta versión es visualmente compacta.',800,1575,1040,30,3);

  return canvas.toDataURL('image/png');
}

async function buildSeparatedImage(qrDataUrl,titleText,descriptionText,contentType,style){
  const qr = await loadImage(qrDataUrl);
  const marker = await loadImage('assets/inter-sg-marker.png');
  const theme = getTheme(style);
  const canvas = document.createElement('canvas');
  canvas.width = 1800;
  canvas.height = 1450;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawRoundRect(ctx,60,60,1680,1330,40,'#ffffff',theme.accent);

  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 54px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('AR Universal INTER SG',110,135);

  ctx.fillStyle = theme.text;
  ctx.font = 'bold 34px Arial';
  ctx.fillText(titleText || 'Experiencia AR',110,190);

  drawRoundRect(ctx,108,235,280,44,20,theme.chip,null);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`Tipo: ${contentType}`,128,264);

  ctx.textAlign = 'center';
  // Bigger QR area but simpler QR content (short URL + ECC M)
  ctx.drawImage(qr,110,310,660,660);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 26px Arial';
  ctx.fillText('Paso 1: Escanea el QR Code',440,1010);

  // Marker much larger
  drawRoundRect(ctx,920,260,760,760,28,'#f9fbfa','#d7e5e0');
  ctx.drawImage(marker,1030,345,540,540);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 26px Arial';
  ctx.fillText('Paso 2: Apunta al Marker INTER SG',1300,1010);

  // helper callout
  drawRoundRect(ctx,105,1065,1590,95,18,'#eef7f3',null);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 22px Arial';
  wrapText(ctx,'La versión separada usa un QR más simple para facilitar el escaneo y un Marker más grande para una mejor detección.',900,1102,1480,28,2);

  ctx.textAlign = 'left';
  if(descriptionText){
    ctx.fillStyle = theme.sub;
    ctx.font = '24px Arial';
    wrapText(ctx,descriptionText,110,1210,1480,30,2);
  }

  drawRoundRect(ctx,110,1270,1490,78,18,'#FFF4CC',theme.accent2);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 22px Arial';
  wrapText(ctx,'Recomendado para YouTube y Web link. Esta versión suele escanear mejor que la integrada.',855,1318,1400,28,2);

  return canvas.toDataURL('image/png');
}

async function generate(){
  const arUrl = buildArUrl();
  if(!arUrl){ setStatus('Falta el URL del contenido.', 'error'); return; }

  const type = detectType(contentUrlInput.value.trim());
  const style = qrStyleInput.value;
  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');

  setStatus('Creando ambas imágenes...', 'warn');

  try{
    const integratedQr = await createQrDataUrl(arUrl, style, false);
    const separatedQr = await createQrDataUrl(arUrl, 'classic', true);
    const integrated = await buildIntegratedImage(integratedQr,titleInput.value.trim(),descriptionInput.value.trim(),type,style);
    const separated = await buildSeparatedImage(separatedQr,titleInput.value.trim(),descriptionInput.value.trim(),type,style);

    integratedPreview.innerHTML = `<img src="${integrated}" alt="Versión integrada del QR y Marker">`;
    separatedPreview.innerHTML = `<img src="${separated}" alt="Versión separada del QR y Marker">`;

    downloadIntegratedBtn.href = integrated;
    downloadIntegratedBtn.download = `QR_Marker_Integrado_INTER_SG_${type}.png`;
    downloadIntegratedBtn.classList.remove('disabled');

    downloadSeparatedBtn.href = separated;
    downloadSeparatedBtn.download = `QR_Marker_Separado_INTER_SG_${type}.png`;
    downloadSeparatedBtn.classList.remove('disabled');

    setStatus('Listo. Ya puedes descargar la versión integrada y la versión separada.', 'ok');
  }catch(e){
    console.error(e);
    integratedPreview.innerHTML = '<p>No se pudo crear la versión integrada.</p>';
    separatedPreview.innerHTML = '<p>No se pudo crear la versión separada.</p>';
    setStatus('No se pudieron crear las imágenes. Verifica conexión a internet para generar el QR.', 'error');
  }
}

baseUrlInput.value = currentBaseUrl();
testBtn.addEventListener('click', testContent);
generateBtn.addEventListener('click', generate);
