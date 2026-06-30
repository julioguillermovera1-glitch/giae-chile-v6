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
