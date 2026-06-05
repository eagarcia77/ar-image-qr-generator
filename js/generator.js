const $ = id => document.getElementById(id);
const contentTypeInput = $('contentType');
const markerTypeInput = $('markerType');
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
const markerPickerCards = document.querySelectorAll('.marker-picker-card');
const selectedMarkerPreview = $('selectedMarkerPreview');
const selectedMarkerCaption = $('selectedMarkerCaption');
const selectedMarkerStatus = $('selectedMarkerStatus');

function setStatus(message, type='ok'){
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function currentBaseUrl(){
  const c = window.location.href;
  return c.substring(0, c.lastIndexOf('/') + 1);
}

function getMarkerConfig(){
  const mode = markerTypeInput ? markerTypeInput.value : 'intersg';
  if(mode === 'hiro') return { mode:'hiro', label:'HIRO', image:'assets/hiro-marker-generic.png' };
  if(mode === 'inter') return { mode:'inter', label:'INTER', image:'assets/inter-marker-generic.png' };
  return { mode:'intersg', label:'INTER SG', image:'assets/inter-sg-marker.png' };
}

function refreshMarkerSelectionUI(){
  const cfg = getMarkerConfig();
  markerPickerCards.forEach(card => {
    card.classList.toggle('selected', card.dataset.marker === cfg.mode);
  });
  if(selectedMarkerPreview) selectedMarkerPreview.src = cfg.image;
  if(selectedMarkerPreview) selectedMarkerPreview.alt = `Vista previa del Marker ${cfg.label}`;
  if(selectedMarkerCaption) selectedMarkerCaption.textContent = `Actualmente está seleccionado: ${cfg.label}.`;
  if(selectedMarkerStatus) selectedMarkerStatus.textContent = `Selected: ${cfg.label}`;
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
  const markerCfg = getMarkerConfig();
  const params = new URLSearchParams();
  params.set('t', type);
  params.set('u', finalUrl);
  params.set('m', markerCfg.mode);
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
    setStatus('YouTube detectado correctamente.', 'ok');
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
    img.crossOrigin='anonymous';
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=src;
  });
}

function dataUrlFromBlob(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(blob);
  });
}

async function createQrDataUrl(data, style='classic', simple=false){
  let ecc = simple ? 'M' : 'H';
  if(style === 'inter') ecc = 'M';
  if(window.QRCodeStyling && (style === 'modern' || style === 'tiger' || style === 'inter')){
    try{
      qrRenderHost.innerHTML = '';
      const options = {
        width: 1200,
        height: 1200,
        type: 'canvas',
        data,
        margin: style === 'inter' ? 16 : (simple ? 8 : 0),
        qrOptions: { errorCorrectionLevel: ecc },
        backgroundOptions: { color: '#ffffff' }
      };
      if(style === 'modern'){
        options.dotsOptions = simple ? { color:'#111111', type:'square' } : { color:'#14211d', type:'rounded' };
        options.cornersSquareOptions = simple ? { color:'#007B5F', type:'square' } : { color:'#007B5F', type:'extra-rounded' };
        options.cornersDotOptions = simple ? { color:'#007B5F', type:'square' } : { color:'#FED141', type:'dot' };
      } else if(style === 'tiger'){
        options.dotsOptions = simple ? { color:'#111111', type:'square' } : { color:'#111111', type:'classy-rounded' };
        options.cornersSquareOptions = { color:'#007B5F', type:'extra-rounded' };
        options.cornersDotOptions = { color:'#FED141', type:'dot' };
      } else if(style === 'inter'){
        options.dotsOptions = { color:'#111111', type:'square' };
        options.cornersSquareOptions = { color:'#007B5F', type:'square' };
        options.cornersDotOptions = { color:'#FED141', type:'square' };
      }
      const qr = new QRCodeStyling(options);
      qr.append(qrRenderHost);
      await new Promise(r => setTimeout(r, 120));
      const canvas = qrRenderHost.querySelector('canvas');
      if(canvas) return canvas.toDataURL('image/png');
      if(typeof qr.getRawData === 'function') return await dataUrlFromBlob(await qr.getRawData('png'));
    }catch(e){ console.warn('Styled QR fallback', e); }
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
  if(fill){ ctx.fillStyle=fill; ctx.fill(); }
  if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=4; ctx.stroke(); }
}

function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=3){
  if(!text) return;
  const words = text.split(' ');
  let line='';
  const lines=[];
  for(const word of words){
    const test=line+word+' ';
    if(ctx.measureText(test).width>maxWidth && line){
      lines.push(line.trim());
      line=word+' ';
    } else line=test;
  }
  lines.push(line.trim());
  lines.slice(0,maxLines).forEach((ln,i)=>ctx.fillText(ln,x,y+(i*lineHeight)));
}

function getTheme(style){
  if(style==='inter') return {accent:'#007B5F', accent2:'#FED141', text:'#14211d', sub:'#44605a', bg:'#ffffff', chip:'#eef7f3', stripe:'#007B5F'};
  if(style==='tiger') return {accent:'#007B5F', accent2:'#FED141', text:'#14211d', sub:'#5d716b', bg:'#ffffff', chip:'#fff6d8', stripe:'#1e1e1e'};
  return style==='modern'
    ? {accent:'#007B5F', accent2:'#FED141', text:'#14211d', sub:'#5d716b', bg:'#ffffff', chip:'#eef7f3', stripe:'#1e1e1e'}
    : {accent:'#007B5F', accent2:'#FED141', text:'#14211d', sub:'#5d716b', bg:'#ffffff', chip:'#f4f4f4', stripe:'#1e1e1e'};
}

function drawInterRibbon(ctx, x, y, w, h, theme, text='INTER SAN GERMÁN'){
  drawRoundRect(ctx, x, y, w, h, 16, theme.accent, null);
  drawRoundRect(ctx, x+8, y+8, w-16, h-16, 12, '#ffffff', null);
  drawRoundRect(ctx, x+18, y+16, 26, h-32, 8, theme.accent2, null);
  drawRoundRect(ctx, x+w-44, y+16, 26, h-32, 8, theme.accent2, null);
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w/2, y + h/2 + 8);
}

function drawInterHeaderBars(ctx, x, y, w, theme){
  drawRoundRect(ctx, x, y, w, 16, 8, theme.accent, null);
  drawRoundRect(ctx, x, y+22, w*0.72, 10, 5, theme.accent2, null);
}

function drawTigerStripes(ctx, x, y, w, h, color='#1e1e1e', alpha=0.14, flip=false){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for(let i=0;i<6;i++){
    const sx = flip ? x + w - (i*48) - 36 : x + i*48;
    const sy = y + (i%2)*16;
    ctx.beginPath();
    if(!flip){
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx+20, sy+18, sx+14, sy+52);
      ctx.quadraticCurveTo(sx+8, sy+78, sx+34, sy+112);
      ctx.quadraticCurveTo(sx+46, sy+76, sx+56, sy+12);
    } else {
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx-20, sy+18, sx-14, sy+52);
      ctx.quadraticCurveTo(sx-8, sy+78, sx-34, sy+112);
      ctx.quadraticCurveTo(sx-46, sy+76, sx-56, sy+12);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawTigerBanner(ctx, x, y, w, h, theme){
  drawRoundRect(ctx, x, y, w, h, 18, theme.accent2, null);
  drawTigerStripes(ctx, x+12, y+8, w-24, h-16, theme.stripe, 0.2, false);
  drawTigerStripes(ctx, x+12, y+8, w-24, h-16, theme.stripe, 0.12, true);
  ctx.fillStyle = theme.text;
  ctx.font='bold 22px Arial';
  ctx.textAlign='center';
  ctx.fillText('TIGER STYLE – INTER SG', x + w/2, y + h/2 + 8);
}

async function buildIntegratedImage(qrDataUrl,titleText,descriptionText,contentType,style,markerCfg){
  const qr = await loadImage(qrDataUrl);
  const marker = await loadImage(markerCfg.image);
  const theme = getTheme(style);
  const canvas = document.createElement('canvas');
  canvas.width=1600;
  canvas.height=1800;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawRoundRect(ctx,60,60,1480,1680,44,'#ffffff',theme.accent);
  if(style==='inter') drawInterHeaderBars(ctx, 110, 94, 1380, theme);

  ctx.fillStyle = theme.accent;
  ctx.font='bold 58px Arial';
  ctx.textAlign='center';
  ctx.fillText('AR Universal',800,170);
  if(style==='inter') drawInterRibbon(ctx, 520, 190, 560, 64, theme, markerCfg.mode === 'inter' ? 'INTER' : markerCfg.mode === 'hiro' ? 'HIRO' : 'INTER SAN GERMÁN');

  ctx.fillStyle = theme.text;
  ctx.font='bold 40px Arial';
  ctx.fillText(titleText || 'Experiencia AR',800,285);

  ctx.fillStyle = theme.sub;
  ctx.font='28px Arial';
  ctx.fillText('Image · Video · YouTube · PDF · Link',800,335);

  drawRoundRect(ctx,170,380,1260,1230,28, style==='inter' ? '#f8fbfa' : '#ffffff', style==='inter' ? '#d9ebe5' : null);
  ctx.drawImage(qr,200,410,1200,1200);
  drawRoundRect(ctx,650,860,300,300,22,'#ffffff','#d7e5e0');
  ctx.drawImage(marker,670,880,260,260);

  ctx.fillStyle = theme.text;
  ctx.font='bold 25px Arial';
  ctx.fillText(`QR Code + Marker ${markerCfg.label} integrado`,800,1355);

  ctx.fillStyle = '#85714D';
  ctx.font='bold 24px Arial';
  ctx.fillText(`Tipo de contenido: ${contentType}`,800,1408);

  if(descriptionText){
    ctx.fillStyle = theme.text;
    ctx.font='24px Arial';
    wrapText(ctx,descriptionText,800,1458,1040,30,3);
  }

  drawRoundRect(ctx,210,1560,1180,120,28,'#FFF4CC',theme.accent2);
  ctx.fillStyle = theme.text;
  ctx.font='bold 24px Arial';
  wrapText(ctx,`Escanea el QR y luego apunta al Marker ${markerCfg.label} del centro.`,800,1605,1040,30,3);
  return canvas.toDataURL('image/png');
}

async function buildSeparatedImage(qrDataUrl,titleText,descriptionText,contentType,style,markerCfg){
  const qr = await loadImage(qrDataUrl);
  const marker = await loadImage(markerCfg.image);
  const theme = getTheme(style);
  const canvas = document.createElement('canvas');
  canvas.width=1800;
  canvas.height=1450;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawRoundRect(ctx,60,60,1680,1330,40,'#ffffff',theme.accent);
  if(style==='inter') drawInterHeaderBars(ctx, 95, 92, 1610, theme);

  ctx.fillStyle = theme.accent;
  ctx.font='bold 54px Arial';
  ctx.textAlign='left';
  ctx.fillText('AR Universal',110,170);

  if(style==='inter') drawInterRibbon(ctx, 1180, 120, 460, 58, theme, markerCfg.mode === 'inter' ? 'INTER' : markerCfg.mode === 'hiro' ? 'HIRO' : 'INTER SAN GERMÁN');

  ctx.fillStyle = theme.text;
  ctx.font='bold 34px Arial';
  ctx.fillText(titleText || 'Experiencia AR',110,228);

  drawRoundRect(ctx,108,268,310,46,20,theme.chip,null);
  ctx.fillStyle = theme.text;
  ctx.font='bold 22px Arial';
  ctx.fillText(`Tipo: ${contentType}`,128,300);

  drawRoundRect(ctx,96,336,700,700,30,'#ffffff','#d7e5e0');
  ctx.textAlign='center';
  ctx.drawImage(qr,116,356,660,660);
  ctx.fillStyle = theme.text;
  ctx.font='bold 26px Arial';
  ctx.fillText('Paso 1: Escanea el QR Code',446,1076);

  drawRoundRect(ctx,900,250,800,800,30,'#f9fbfa','#d7e5e0');
  ctx.drawImage(marker,1020,340,560,560);
  ctx.fillStyle = theme.text;
  ctx.font='bold 26px Arial';
  ctx.fillText(`Paso 2: Apunta al Marker ${markerCfg.label}`,1300,1076);

  drawRoundRect(ctx,105,1112,1590,95,18,style==='inter' ? '#eef7f3' : '#eef7f3',null);
  ctx.fillStyle = theme.text;
  ctx.font='bold 22px Arial';
  wrapText(ctx,`Esta versión usa QR simple y Marker ${markerCfg.label} grande para facilitar el escaneo y la detección.`,900,1148,1480,28,2);

  ctx.textAlign='left';
  if(descriptionText){
    ctx.fillStyle = theme.sub;
    ctx.font='24px Arial';
    wrapText(ctx,descriptionText,110,1258,1480,30,2);
  }

  drawRoundRect(ctx,110,1310,1490,78,18,'#FFF4CC',theme.accent2);
  ctx.fillStyle = theme.text;
  ctx.font='bold 22px Arial';
  ctx.textAlign='center';
  wrapText(ctx,'Recomendado para YouTube y Web link. Esta versión suele escanear mejor que la integrada.',900,1358,1320,28,2);
  return canvas.toDataURL('image/png');
}

async function generate(){
  const arUrl = buildArUrl();
  if(!arUrl){ setStatus('Falta el URL del contenido.', 'error'); return; }

  const type = detectType(contentUrlInput.value.trim());
  const style = qrStyleInput.value;
  const markerCfg = getMarkerConfig();

  resultUrl.value = arUrl;
  openBtn.href = arUrl;
  openBtn.classList.remove('disabled');
  setStatus(`Creando imágenes con Marker ${markerCfg.label}...`, 'warn');

  try{
    const integratedQr = await createQrDataUrl(arUrl, style, false);
    const separatedQr = await createQrDataUrl(arUrl, style === 'inter' ? 'inter' : 'classic', true);

    const integrated = await buildIntegratedImage(integratedQr,titleInput.value.trim(),descriptionInput.value.trim(),type,style,markerCfg);
    const separated = await buildSeparatedImage(separatedQr,titleInput.value.trim(),descriptionInput.value.trim(),type,style,markerCfg);

    integratedPreview.innerHTML = `<img src="${integrated}" alt="Versión integrada">`;
    separatedPreview.innerHTML = `<img src="${separated}" alt="Versión separada">`;

    downloadIntegratedBtn.href = integrated;
    downloadIntegratedBtn.download = `QR_Marker_Integrado_${markerCfg.mode}_${type}_${style}.png`;
    downloadIntegratedBtn.classList.remove('disabled');

    downloadSeparatedBtn.href = separated;
    downloadSeparatedBtn.download = `QR_Marker_Separado_${markerCfg.mode}_${type}_${style}.png`;
    downloadSeparatedBtn.classList.remove('disabled');

    setStatus(`Listo. El Marker seleccionado es ${markerCfg.label}.`, 'ok');
  }catch(e){
    console.error(e);
    integratedPreview.innerHTML = '<p>No se pudo crear la versión integrada.</p>';
    separatedPreview.innerHTML = '<p>No se pudo crear la versión separada.</p>';
    setStatus('No se pudieron crear las imágenes. Verifica conexión a internet para generar el QR.', 'error');
  }
}


baseUrlInput.value = currentBaseUrl();
markerTypeInput.addEventListener('change', refreshMarkerSelectionUI);
markerPickerCards.forEach(card => {
  card.addEventListener('click', () => {
    markerTypeInput.value = card.dataset.marker;
    refreshMarkerSelectionUI();
  });
});
refreshMarkerSelectionUI();
testBtn.addEventListener('click', testContent);
generateBtn.addEventListener('click', generate);

