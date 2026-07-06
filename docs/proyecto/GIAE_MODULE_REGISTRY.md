# GIAE Chile
# Registro Oficial de Módulos

Versión: 1.0
Estado: Documento Oficial

---

# Objetivo

Este documento mantiene el inventario oficial de todos los módulos del sistema GIAE.

Su propósito es controlar:

- Estado de desarrollo.
- Nivel de integración.
- Dependencias.
- Responsabilidad.
- Prioridad.
- Próximos trabajos.

Todo módulo incorporado a GIAE deberá aparecer en este registro.

---

# Estados Oficiales

🟢 Finalizado

El módulo está completo, probado e integrado.

🟡 En desarrollo

El módulo existe pero requiere mejoras o integración.

🔵 En pruebas

El módulo está siendo validado.

⚪ Planificado

Aún no comienza su desarrollo.

🔴 Suspendido

Desarrollo detenido.

---

# Módulos Principales

## Project Engine

Estado:
🟡 En desarrollo

Responsabilidad:

Administrar proyectos.

Entradas:

- Datos del proyecto
- Usuario

Salidas:

- Proyecto estructurado

Depende de:

- Store
- Ingeniería

Prioridad:

Muy Alta

---

## Ingeniería

Estado:

🟡 En desarrollo

Responsabilidad:

Realizar cálculos eléctricos.

Funciones:

- Potencia
- Corriente
- Conductores
- Protecciones
- ICC
- Caída de tensión
- Balance de fases

Prioridad:

Muy Alta

---

## Normative Engine

Estado:

🟡 En desarrollo

Responsabilidad:

Determinar qué normativa corresponde aplicar.

Nunca ejecuta reglas.

Nunca genera observaciones.

Prioridad:

Muy Alta

---

## Catálogo Maestro Normativo

Estado:

🟡 En desarrollo

Responsabilidad:

Única fuente oficial de normativa.

Contiene:

- RIC
- DS Nº8
- Instrucciones Técnicas
- Catálogos

Prioridad:

Muy Alta

---

## Rule Engine

Estado:

🟡 En desarrollo

Responsabilidad:

Ejecutar reglas técnicas.

Entradas:

- Catálogo Maestro
- Proyecto

Salidas:

- Resultado de validación

Prioridad:

Muy Alta

---

## Inspector Técnico

Estado:

🟡 En desarrollo

Responsabilidad:

Interpretar resultados.

Generar:

- Observaciones
- Riesgo
- Recomendaciones

Prioridad:

Muy Alta

---

## Auditoría Técnica

Estado:

🟡 En desarrollo

Responsabilidad:

Revisar consistencia documental.

Prioridad:

Alta

---

## Documentación

Estado:

🟡 En desarrollo

Responsabilidad:

Generar informes.

Nunca interpreta normativa.

Prioridad:

Alta

---

## Presupuesto

Estado:

⚪ Planificado

Responsabilidad:

Calcular costos del proyecto.

Prioridad:

Media

---

## GIAE CAD

Estado:

⚪ Planificado

Responsabilidad:

Generar:

- DXF
- Planos
- Unifilares
- Cuadros de carga
- Canalizaciones

Prioridad:

Baja (hasta finalizar la versión 1.0)

---

# Reglas del Registro

Todo módulo deberá indicar:

- Estado.
- Responsable.
- Dependencias.
- Entradas.
- Salidas.
- Prioridad.

No podrá existir un módulo fuera de este registro.

---

# Política de Integración

Antes de marcar un módulo como Finalizado deberá cumplir:

✓ Documentado

✓ Integrado

✓ Probado

✓ Sin errores conocidos

✓ Compatible con la arquitectura oficial

✓ Compatible con el Catálogo Maestro Normativo

---

# Próximos Objetivos

Integrar completamente:

- Project Engine
- Ingeniería
- Normative Engine
- Rule Engine
- Inspector Técnico
- Documentación

Una vez integrados, comenzará la fase de auditoría funcional del sistema.

---

---

# Modulos estrategicos incorporados al roadmap

## Roadmap / Producto

Estado:
En desarrollo

Responsabilidad:
Mantener la ruta oficial de 6 fases, criterios de salida, documentos vigentes y datos estructurados del producto.

Archivos:

- docs/ROADMAP_6_FASES_GIAE_CHILE.md
- docs/INDICE_PRODUCTO_GIAE.md
- docs/data/producto/product-manifest.json
- docs/data/producto/roadmap-6-fases.json

Prioridad:
Muy Alta

---

## CAD Electrico GIAE 2.0

Estado:
Planificado

Responsabilidad:
Crear un editor propio de planos electricos con capas, simbolos, circuitos, tableros, canalizaciones y validacion tecnica.

Restriccion:
No copiar AutoCAD ni su codigo, interfaz, nombres internos o logica propietaria.

Prioridad:
Estrategica

---

## Lector Documental / Norma Chile

Estado:
Planificado

Responsabilidad:
Leer PDF, imagenes, textos y documentos tecnicos para extraer datos, evaluar coherencia y generar reglas propias con trazabilidad.

Prioridad:
Alta

---

## Razonador Tecnico GIAE

Estado:
Vision 2.0

Responsabilidad:
Emitir recomendaciones con evidencia, reglas, calculos, supuestos, nivel de confianza y bloqueos cuando falten datos.

Prioridad:
Estrategica

---

Fin del documento.
