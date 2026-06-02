# Generador AR + QR con HIRO

Este paquete permite pegar el URL de una imagen y generar un QR que abre directamente una experiencia de Realidad Aumentada con marcador HIRO.

## Flujo
1. Abrir `index.html`.
2. Pegar la URL directa de la imagen.
3. Generar el QR.
4. Escanear el QR.
5. La página `marker-ar.html` solicita la cámara automáticamente y muestra la imagen al detectar el marcador HIRO.

## Archivos principales
- `index.html`: generador de QR.
- `marker-ar.html`: experiencia AR que activa la cámara automáticamente.
- `marker-hiro.html`: página para ver/imprimir el marcador HIRO.

## Nota
El enlace de la imagen debe ser directo y accesible para el usuario que escanea el QR.
