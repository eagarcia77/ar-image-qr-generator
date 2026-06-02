# Generador AR INTER SG para Blackboard

Versión verificada para trabajar con:
- Imágenes del Content Collection de Blackboard
- Videos MP4/WebM del Content Collection
- YouTube
- Marcador INTER SG con colores institucionales: verde #007B5F y amarillo #FED141

## Archivos principales
- `index.html`: generador de QR y tarjeta híbrida
- `marker-ar.html`: experiencia AR
- `marker-inter-sg.html`: marcador INTER SG para imprimir o descargar
- `test-marker.html`: prueba del marcador
- `diagnostico-blackboard.html`: prueba de enlaces del Content Collection
- `INSTRUCCIONES_COMPLETAS.txt`: guía paso a paso

## Nota técnica
Para máxima compatibilidad con Blackboard, el contenido se muestra como capa HTML sobre la cámara. Esto evita problemas comunes de CORS al usar archivos del Content Collection como texturas WebGL.

## Permisos Blackboard
El archivo debe tener permiso Read para Student o Course Users.
