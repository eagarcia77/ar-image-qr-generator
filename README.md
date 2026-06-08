# Generador Realidad Aumentada – Markers corregidos

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


NOTA: La opción Marker INTER ahora usa un marcador que dice solamente INTER.


Descarga individual de Markers: ahora puede descargar INTER SG, INTER y HIRO por separado, tanto en PNG como en PATT.


Nueva función: ahora el usuario puede previsualizar el Marker grande y escogerlo visualmente antes de generar.


Mejora visual: ahora el Marker seleccionado resalta con borde verde, insignia de seleccionado y estilo más moderno.


Versión premium: ahora incluye tarjetas premium con iconos y animación suave al seleccionar el Marker.


Encabezado institucional actualizado: Universidad Interamericana de Puerto Rico Recinto de San Germán.


Actualización 3D: las imágenes ahora se muestran con un efecto visual más futurista, flotante y con apariencia 3D dentro de la experiencia de Realidad Aumentada.


Verificación adicional: se agrandó el Marker visual y se corrigió la versión integrada para que la parte inferior del QR Code no quede tapada por texto ni elementos superpuestos.


Ajuste adicional en versión integrada: el Marker integrado ahora es más grande para mejorar la detección, y el diseño del QR se reorganizó para que solo tenga una superposición mínima y siga funcionando mejor.


Innovación añadida: el visor AR ahora incluye una experiencia más moderna e inmersiva. Los videos se muestran en una tarjeta futurista y el sistema intenta reproducirlos automáticamente. Si el dispositivo bloquea el audio, aparecen botones para reproducir y activar audio fácilmente.


Actualización YouTube: los videos de YouTube ahora se muestran en una tarjeta flotante futurista dentro del visor AR. El sistema solicita autoplay y audio; si el navegador bloquea el sonido automático, aparece un botón para reproducir YouTube y activar la reproducción mediante interacción del usuario.



Actualización:
- Se añadió una marca de agua pequeña y discreta con el texto E.A.G.R. en la esquina inferior derecha.
- La marca de agua no interfiere con el uso del programa ni con el contenido.
- En el visor AR, los comentarios/mensajes y controles se ocultan automáticamente después de 5 segundos.
- Después de 5 segundos se queda visible solo el contenido presentado por el Marker.
- Si el usuario toca la pantalla, los controles vuelven por 5 segundos.



Actualización de interfaz AR:
- Ahora todo el interfaz visible se oculta automáticamente después de 5 segundos.
- Se ocultan comentarios, mensajes, controles y botones para dejar solamente el contenido presentado por el Marker.
- Si el usuario toca la pantalla, los controles vuelven a aparecer por 5 segundos.



Actualización Scan Rápido:
- El QR Code ahora se genera en alto contraste, con más margen y menos decoración.
- La versión integrada ya no coloca el Marker encima del QR; ahora el QR queda limpio y el Marker queda separado abajo.
- El Marker se aumentó de tamaño en la versión separada para mejorar la detección.
- La versión separada es la recomendada cuando el enlace es largo o cuando el QR tarda en escanear.
- Se ajustó la configuración del visor AR para mejorar la detección del Marker.
