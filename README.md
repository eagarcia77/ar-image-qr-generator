# Generador Universal AR – Markers corregidos

Esta versión corrige el problema donde el Marker seleccionado no cambiaba correctamente.

## Markers disponibles
- Marker INTER SG
- Marker INTER (genérico para otras Inter)
- Marker HIRO (totalmente genérico)

## Corrección realizada
- Cada Marker tiene su propia imagen PNG.
- Cada Marker tiene su propio archivo `.patt`.
- El visor AR carga tres Markers diferentes y activa el que se seleccione en el generador.
- El QR incluye el parámetro `m` para indicar el Marker correcto.
- La imagen generada muestra el Marker correcto.

## Archivo útil
- `markers.html`: muestra los tres Markers disponibles.
