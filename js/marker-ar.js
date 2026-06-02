
const p=new URLSearchParams(location.search),mediaUrl=p.get('data')||p.get('img')||'',type=p.get('type')||'image',title=p.get('title')||'AR INTER SG';
const titleText=document.getElementById('titleText'),errorBox=document.getElementById('errorBox'),actionBox=document.getElementById('actionBox'),actionText=document.getElementById('actionText'),playVideoBtn=document.getElementById('playVideoBtn'),youtubeBtn=document.getElementById('youtubeBtn'),arImage=document.getElementById('arImage'),arVideo=document.getElementById('arVideo'),mediaPlane=document.getElementById('mediaPlane'),marker=document.getElementById('interMarker'),zoomInBtn=document.getElementById('zoomInBtn'),zoomOutBtn=document.getElementById('zoomOutBtn'),resetBtn=document.getElementById('resetBtn');
titleText.textContent=title;
let baseW=1.45,baseH=1.0,scale=1;
function showError(msg){errorBox.textContent=msg;errorBox.style.display='block'}
function showAction(msg){actionText.textContent=msg;actionBox.style.display='block'}
function applyScale(){mediaPlane.setAttribute('width',(baseW*scale).toFixed(3));mediaPlane.setAttribute('height',(baseH*scale).toFixed(3))}
function setBaseRatio(w,h){const ratio=w/h||1;baseW=1.45;baseH=baseW/ratio;if(baseH>1.65){baseH=1.65;baseW=baseH*ratio}applyScale()}
function extractYoutubeId(url){for(const pat of [/youtu\.be\/([A-Za-z0-9_-]{6,})/,/youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/]){const m=url.match(pat);if(m)return m[1]}try{return new URL(url).searchParams.get('v')||''}catch{return''}}
function loadImage(url){const tester=new Image();tester.onload=()=>{arImage.setAttribute('src',url);mediaPlane.setAttribute('src','#arImage');mediaPlane.setAttribute('material','transparent:true; alphaTest:0.01; side:double');setBaseRatio(tester.width,tester.height)};tester.onerror=()=>showError('La imagen no se pudo cargar. Verifica que el enlace sea directo y tenga permisos de lectura.');tester.src=url}
async function tryPlayVideo(){try{await arVideo.play();playVideoBtn.style.display='none';actionBox.style.display='none'}catch(e){showAction('Si el video no comienza automáticamente, toca el botón.');playVideoBtn.style.display='inline-block'}}
function loadVideo(url){arVideo.src=url;arVideo.load();arVideo.addEventListener('loadedmetadata',()=>{mediaPlane.setAttribute('src','#arVideo');mediaPlane.setAttribute('material','transparent:false; side:double');setBaseRatio(arVideo.videoWidth||16,arVideo.videoHeight||9);tryPlayVideo()});arVideo.addEventListener('error',()=>showError('El video no se pudo cargar. Usa un enlace directo MP4/WebM con permisos de lectura.'));marker.addEventListener('markerFound',tryPlayVideo);playVideoBtn.addEventListener('click',tryPlayVideo);document.body.addEventListener('touchstart',tryPlayVideo,{once:true})}
function loadYoutube(url){const id=extractYoutubeId(url);if(!id){showError('No se pudo identificar el video de YouTube.');return}const thumb=`https://img.youtube.com/vi/${id}/hqdefault.jpg`;youtubeBtn.href=url;youtubeBtn.style.display='inline-block';showAction('YouTube no se reproduce como textura AR directa. Se muestra la miniatura y puedes abrir el video con este botón.');loadImage(thumb)}
zoomInBtn.addEventListener('click',()=>{scale=Math.min(scale+0.15,4);applyScale()});
zoomOutBtn.addEventListener('click',()=>{scale=Math.max(scale-0.15,0.25);applyScale()});
resetBtn.addEventListener('click',()=>{scale=1;applyScale()});
let pinchStartDist=null,pinchStartScale=1;
function dist(t1,t2){const dx=t2.clientX-t1.clientX,dy=t2.clientY-t1.clientY;return Math.hypot(dx,dy)}
document.addEventListener('touchstart',e=>{if(e.touches.length===2){pinchStartDist=dist(e.touches[0],e.touches[1]);pinchStartScale=scale}},{passive:true});
document.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinchStartDist){const newDist=dist(e.touches[0],e.touches[1]);scale=Math.max(0.25,Math.min(4,pinchStartScale*(newDist/pinchStartDist)));applyScale()}},{passive:true});
document.addEventListener('touchend',e=>{if(e.touches.length<2)pinchStartDist=null},{passive:true});
if(!mediaUrl){showError('No hay contenido AR. Regenera el QR Code desde el generador.')}else if(type==='video'){loadVideo(mediaUrl)}else if(type==='youtube'){loadYoutube(mediaUrl)}else{loadImage(mediaUrl)}
