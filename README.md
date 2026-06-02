# Generador de Imágenes AR para Blackboard — Versión corregida

Esta versión corrige el error de “No hay contenido” cuando el URL de Blackboard Content Collection contiene `?`, `&`, `=`, tokens o parámetros largos.

## Archivos principales

- `index.html`: generador del enlace y QR Code.
- `viewer.html`: visor AR que abre la cámara y muestra la imagen.
- `js/generator.js`: codifica el contenido de forma segura en `data=`.
- `js/viewer.js`: lee el contenido codificado y muestra errores claros.

## Cómo usar

1. Sube el paquete a tu hosting o a GitHub Pages.
2. Abre `index.html`.
3. Pega el URL directo de una imagen de Blackboard Content Collection.
4. Presiona **Probar imagen**.
5. Si carga, presiona **Generar QR Code**.
6. Copia el QR o el enlace generado en Blackboard Ultra.

## Importante

Si el estudiante no tiene permiso para ver la imagen en Blackboard, el visor no podrá cargarla. Para evitar problemas, verifica que el enlace abra desde el celular o desde una ventana privada.
