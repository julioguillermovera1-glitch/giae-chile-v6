# GIAE Chile v1.0 - Etapa 2.5

Plataforma Integral para Proyectos Eléctricos.

Diseñado y desarrollado por Julio Guillermo Vera · © 2026 GIAE Chile. Todos los derechos reservados.

## Estado actual

- Etapa 1: Arquitectura general terminada.
- Etapa 2.1: Portada profesional terminada.
- Etapa 2.2: Dashboard por perfil terminado.
- Etapa 2.3: Menú lateral agrupado terminado.
- Etapa 2.4: Sistema de ventanas internas terminado.
- Etapa 2.5: Proyecto Activo terminado.

## Proyecto Activo

El Proyecto Activo es el núcleo común de la plataforma. Centraliza los datos que luego utilizarán cargas, cuadro de carga, empalme, tierra, unilineal, documentación, presupuesto y auditoría.

Incluye:

- Datos generales del proyecto.
- Datos técnicos base.
- Cargas registradas.
- Potencia instalada y demanda estimada.
- Checklist automático.
- Historial de cambios.
- Exportación e importación `.giae`.

## Norma de desarrollo

GIAE Chile no debe inventar datos técnicos ni normativos. Toda recomendación debe estar respaldada por normativa autorizada: RIC, IEC aplicable a instalaciones eléctricas y DS N°8 cuando corresponda.


## Etapa 2.7
Administrador de Proyectos local agregado. Permite crear, guardar, abrir, duplicar, importar, exportar, archivar y eliminar proyectos `.giae`. La estructura queda preparada para Cloudflare D1/R2.


### Etapa 2.9 - Biblioteca Técnica GIAE

Incluye `data/biblioteca-tecnica.json`, `core/technicalLibrary.js` y el módulo administrativo `modules/biblioteca/biblioteca.js`. Esta base será usada por los motores de cálculo y por la auditoría normativa.


### Etapa 3.0.2b
Se incorporó el primer paquete de reglas RIC 4 para el Motor Normativo GIAE.


## Etapa 3.0.2b

Agregado paquete inicial de reglas RIC 3 para alimentadores y demanda.


## Etapa 3.0.2c
Se agrega paquete inicial de reglas RIC 5: seguridad eléctrica, diferenciales, tensiones de seguridad, esquemas TT/TN/IT y corte automático.


## Etapa 3.0.2d — Reglas RIC 6 iniciales

Se incorpora el paquete inicial de reglas de ingeniería para Puesta a Tierra y Enlace Equipotencial.

Incluye:
- Sistema de puesta a tierra y componentes SPT.
- Conductor PE, continuidad y enlace equipotencial.
- Electrodos, cámara de registro y documentación.
- Medición real en terreno como requisito para estado verificado.
- Comparación entre cálculo preliminar y medición real.

Regla central: el cálculo de tierra en GIAE es preliminar y nunca reemplaza la medición real en terreno.


## Etapa 4.0.1 - Motor de Cálculo de Cargas

Se incorpora el primer motor de ingeniería de GIAE: cálculo de cargas, demanda, corriente, balance de fases y recomendaciones preliminares para protección, conductor y canalización.

## Etapa 4.0.3 - Motor de Ingeniería Eléctrica

Se incorpora el Motor de Ingeniería Eléctrica como capa sobre el Motor de Cargas. Este motor genera datos reutilizables para cuadro de carga, protecciones, conductores, canalizaciones, unilineal, presupuesto, auditoría y documentación.

Incluye:
- Cálculo de caída de tensión preliminar por circuito.
- Selección de poder de corte preliminar según Icc declarada o valor por defecto.
- Nivel de confianza de cada recomendación: validada preliminar, requiere revisión o información insuficiente.
- Salidas estructuradas para cuadro de carga automático.
- Materiales técnicos consolidados para presupuesto.
- Trazabilidad técnica ampliada.

Regla central: cada cálculo debe existir una sola vez y quedar almacenado en el Proyecto Activo.


## Etapa 4.0.3

Se agrega Motor de Balance de Fases y Demanda, con análisis R/S/T, desbalance, recomendaciones preliminares y asignación manual/automática de fases.


## Etapa 4.0.4 - Centro de Documentación SEC

Se reemplaza el enfoque limitado a TE1 por un Motor Documental preparado para distintos documentos eléctricos. TE1 queda activo inicialmente; TE2, TE3, TE3.4, TE4 y TE6 quedan registrados como pendientes de implementación normativa.


## Etapa 5.0 · Motor de Tableros Inteligente

Se agrega el módulo Tableros dentro de Ingeniería, conectado al Proyecto Activo y al Motor de Ingeniería Eléctrica.


## Etapa 6.0 — GIAE Project Engine

Se agrega el GPE como núcleo de proyecto inteligente: estado, dependencias, auditoría continua, revisiones y diagnóstico descargable.
