# GIAE Chile v1.2.1

Gestor Inteligente de Análisis para Empalmes y Proyectos Eléctricos.

Creado, desarrollado y dirigido por **Julio Vera Concha**. © 2026. Todos los derechos reservados.

## Corrección v1.2.1

- Se reparó el módulo de exportación.
- El JSON queda como **respaldo interno GIAE**, no como informe principal.
- Se agregó exportación profesional:
  - PDF profesional usando impresión del navegador.
  - Word editable `.doc`.
  - HTML profesional.
- El informe incluye portada, datos del proyecto, instalador, cuadro de cargas, unilineal, tierra, empalme, auditoría inteligente, presupuesto y firma.



## v1.2.1
- Reparados botones de exportación: PDF/imprimir, Word editable, HTML profesional y JSON de respaldo.
- El PDF ya no depende de ventana emergente nueva; usa iframe de impresión con fallback a HTML descargable.


## v1.2.1
- Corrección de exportación Word: el diagrama unilineal ya no se convierte en texto desordenado.
- Se agrega resumen técnico ordenado del unilineal para Word.
- PDF/HTML mantienen visualización profesional.


## v1.2.1
- Informe Word/PDF/HTML con diagrama unilineal como imagen SVG embebida.
- Se agrega análisis técnico del unilineal: Ib, conductor, Iz, longitud estimada, caída de tensión en V y %, y estado preliminar.
- Mantiene autoría oficial de Julio Vera Concha.


## v1.2.1
- Exportación Word reparada usando formato MHTML multipart.
- El unilineal se inserta como imagen PNG vinculada internamente para mayor compatibilidad con Microsoft Word.
- PDF y HTML se mantienen operativos.


## Versión 1.2.1
- Ajuste automático de escala del diagrama unilineal en Word.
- Imagen del unilineal limitada al ancho útil A4.
- Diagrama centrado para evitar cortes laterales.
