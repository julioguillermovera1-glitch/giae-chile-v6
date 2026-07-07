# Flujo guiado GIAE v1

## Funcion

El flujo guiado revisa el Proyecto Activo y calcula un estado global para decidir que debe hacer el usuario despues.

## Estados

- `completado`: la etapa tiene evidencia minima.
- `observado`: la etapa existe pero tiene advertencias.
- `bloqueado`: falta un dato o evidencia importante.
- `pendiente`: la etapa aun no tiene informacion suficiente.
- `revisable`: etapa util para revision preliminar, no final.

## Salidas

- Estado del flujo.
- Porcentaje de avance.
- Etapa actual.
- Siguiente accion.
- Bloqueos.
- Observaciones.
- Reporte exportable.

## Uso

El usuario debe abrir el modulo Flujo guiado antes de exportar, presupuestar o considerar que un proyecto esta listo para revision externa.