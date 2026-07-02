# # GIAE CHILE

# Constitución Técnica

| Campo | Valor |
|--------|-------|
| Documento | Constitución Técnica GIAE |
| Versión | 1.0 |
| Estado | Vigente |
| Última revisión | 02-07-2026 |
| Autor | Proyecto GIAE Chile – Julio Vera |
---

# Preámbulo

La presente Constitución Técnica establece los principios, objetivos, arquitectura y reglas oficiales para el desarrollo de GIAE (Gestión Integral para Instalaciones Eléctricas).

Todo desarrollo futuro deberá respetar este documento como máxima referencia técnica del proyecto.

---

# Artículo 1 – Identidad

GIAE (Gestión Integral para Instalaciones Eléctricas) es una plataforma de ingeniería diseñada para asistir a profesionales en el diseño, cálculo, verificación, auditoría y documentación de instalaciones eléctricas conforme a la normativa chilena vigente.

---

# Artículo 2 – Misión

Desarrollar una plataforma técnica que permita reducir errores de diseño, mejorar la calidad de los proyectos eléctricos y asistir al instalador durante todo el proceso de ingeniería y revisión documental.

---

# Artículo 3 – Visión

Convertirse en la plataforma chilena de referencia para el desarrollo y auditoría de instalaciones eléctricas, evolucionando posteriormente hacia herramientas CAD, BIM e integración documental.

---

# Artículo 4 – Objetivos

Los objetivos permanentes de GIAE son:

- Diseñar instalaciones eléctricas.
- Realizar cálculos eléctricos.
- Verificar el cumplimiento normativo.
- Detectar errores antes de la presentación del proyecto.
- Generar documentación técnica.
- Auditar carpetas técnicas.
- Ayudar al profesional a presentar proyectos técnicamente consistentes.

---

# Artículo 5 – Alcance

GIAE no reemplaza el criterio profesional del instalador eléctrico ni las atribuciones de la SEC o de las empresas distribuidoras.

Su finalidad es proporcionar herramientas de apoyo técnico para mejorar la calidad de los proyectos.

---

# Artículo 6 – Arquitectura Oficial

Toda evolución del sistema deberá respetar la arquitectura oficial:

Proyecto

↓

Motor de Ingeniería

↓

Normative Engine

↓

Catálogo Maestro Normativo

↓

Rule Engine

↓

Inspector Técnico

↓

Documentación

↓

Exportación

---

# Artículo 7 – Principios Fundamentales

Todo desarrollo deberá respetar los siguientes principios:

- Una sola fuente de verdad.
- Una sola responsabilidad por módulo.
- No duplicar código.
- No duplicar reglas.
- Mantener trazabilidad.
- Mantener modularidad.
- Mantener escalabilidad.
- Mantener compatibilidad futura.

---

# Artículo 8 – Normativa Oficial

La base normativa de GIAE estará compuesta exclusivamente por normativa vigente.

Principalmente:

- Reglamento DS N.º 8.
- RIC 1 al RIC 19.
- Instrucciones Técnicas SEC vigentes.
- Documentos oficiales emitidos por la SEC.
- Normas IEC e ISO cuando correspondan.
- Normas Chilenas vigentes cuando sean citadas por la normativa oficial.

No se utilizarán normas derogadas como base normativa activa.

---

# Artículo 9 – Catálogo Maestro Normativo

Toda regla utilizada por GIAE deberá provenir exclusivamente del Catálogo Maestro Normativo.

No se permitirá incorporar reglas directamente en el código fuente.

---

# Artículo 10 – Política de Desarrollo

Todo nuevo módulo deberá responder las siguientes preguntas:

- ¿Qué hace?
- ¿Qué recibe?
- ¿Qué entrega?
- ¿Con qué módulos se comunica?
- ¿Dónde se ubica dentro de la arquitectura?

Si no puede responder estas preguntas, el módulo no será incorporado.

---

# Artículo 11 – Política de Calidad

Un módulo solamente podrá declararse finalizado cuando:

- Esté documentado.
- Esté integrado.
- Pase las pruebas.
- No presente errores conocidos.
- Respete la arquitectura oficial.
- Sea compatible con el Catálogo Maestro Normativo.

---

# Artículo 12 – Compromiso del Proyecto

GIAE será desarrollado priorizando la calidad técnica, la claridad del código, la trazabilidad normativa y la utilidad práctica para el profesional eléctrico chileno.

Todas las futuras versiones deberán respetar esta Constitución Técnica.

---

# Fin del Documento