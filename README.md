# Generador de Realidad Aumentada Inter SG

Este paquete permite generar experiencias AR con imágenes o videos. El profesor pega el URL directo del contenido, genera un QR Code y descarga el QR junto con el marcador Inter SG para publicarlos en Blackboard.

## Archivos principales

- `index.html`: generador de QR Code.
- `marker-ar.html`: experiencia AR que activa la cámara automáticamente.
- `marker-inter-sg.html`: marcador Inter SG para descargar o imprimir.
- `assets/inter-sg-marker.png`: imagen del marcador Inter SG.
- `INSTRUCCIONES_PASO_A_PASO.txt`: guía sencilla para profesores.

## Uso básico

1. Abrir `index.html`.
2. Pegar el URL directo de una imagen o video.
3. Probar el contenido.
4. Generar el QR Code.
5. Descargar el QR Code.
6. Descargar el marcador Inter SG.
7. Publicar ambas imágenes en Blackboard.

## Nota técnica

Para videos, se recomienda usar MP4. El navegador puede solicitar interacción del usuario para iniciar audio/video; por eso el visor incluye un botón de activación cuando sea necesario.
