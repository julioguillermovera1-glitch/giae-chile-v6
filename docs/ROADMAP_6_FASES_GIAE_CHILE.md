# GIAE Chile - Roadmap oficial de 6 fases

Fecha: 2026-07-06
Director del proyecto: Julio Guillermo Vera
Objetivo: ordenar GIAE desde la base actual hasta una version 2.0 con CAD electrico, lectura documental y razonamiento verificable.

## Principio rector

GIAE no debe copiar codigo de internet, repositorios, ejemplos, otras IA ni bloques generados fuera de este repositorio. Toda mejora debe nacer desde el criterio tecnico de GIAE, con implementacion propia, trazabilidad y pruebas.

GIAE tampoco debe inventar cumplimiento normativo. Cuando falte una regla, un documento, una medicion o un dato de terreno, el sistema debe decir requiere revision.

## Fase 1 - Depuracion y base publicable

Meta: dejar una base limpia, entendible y estable.

Trabajo principal:

- Definir entrada oficial: index.html, core/main.js y css/platform.css.
- Marcar js/app.js y css/styles.css como legado si no forman parte de la app nueva.
- Mantener una sola fuente activa para reglas normativas.
- Corregir referencias normativas imprecisas: usar Decreto Supremo N8 / DS8 como denominacion oficial del proyecto.
- Revisar textos que prometen mas de lo que GIAE puede validar.
- Mantener NCh4 solo como referencia historica excluida.
- Crear checklist de pruebas antes de publicar.

Criterio de salida:

- JS y JSON validos.
- Sin rutas activas duplicadas.
- Documentacion base coherente.
- App local navegable sin errores criticos.

## Fase 2 - Version 1.0 instalable local

Meta: primera version publicable honesta.

Trabajo principal:

- Crear PWA instalable con manifest, iconos propios, offline y cache controlado.
- Mantener exportacion e importacion .giae como respaldo portable.
- Agregar modo publicable local: mostrar solo funciones listas y marcar lo futuro como futuro.
- Mejorar experiencia movil y escritorio.
- Crear flujo guiado de proyecto: datos, cargas, cuadro, tablero, tierra, empalme, presupuesto, documentacion y auditoria.

Criterio de salida:

- GIAE se puede instalar como app desde navegador.
- Un usuario puede crear, guardar, exportar e importar un proyecto.
- Nada se presenta como certificacion final sin medicion o revision profesional.

## Fase 3 - Inteligencia normativa y lectura de documentos

Meta: que GIAE lea documentos y los convierta en conocimiento evaluable, sin copiar textos completos.

Trabajo principal:

- Crear motor de ingestion documental: PDF, imagen, texto, planilla y respaldo .giae.
- Extraer estructura: titulo, fecha, fuente, articulos/secciones, tablas y conceptos.
- Convertir documentos en reglas propias con referencia, no con copias largas.
- Integrar Decreto Supremo N8, RIC 1-19 e IEC aplicable como fuentes trazables.
- Crear evaluador documental: memorias, informes, presupuestos, certificados, planos y evidencias.
- Crear explicacion por resultado: dato usado, regla aplicada, supuesto y accion recomendada.

Criterio de salida:

- GIAE puede leer un documento, detectar que tipo es y decir que falta para evaluarlo.
- Las reglas tienen fuente, apartado referencial, datos requeridos y nivel de confianza.

## Fase 4 - Nube, usuarios, licencias y colaboracion

Meta: pasar de herramienta local a plataforma multiusuario.

Trabajo principal:

- Crear API propia en Cloudflare Workers.
- Usar D1 para usuarios, empresas, roles, licencias, proyectos e historial.
- Usar R2 para archivos: .giae, informes, logos, fotos, planos, evidencias y documentos.
- Crear autenticacion real y permisos por rol.
- Mantener modo local/offline como respaldo.
- Registrar auditoria de cambios para cada proyecto.

Criterio de salida:

- Empresa e instalador pueden trabajar con proyectos compartidos.
- El administrador ve usuarios reales, licencias y actividad real.
- La app local puede sincronizar sin perder el formato .giae.

## Fase 5 - CAD electrico GIAE 2.0

Meta: crear un CAD propio para planos electricos, inspirado en flujos conocidos de dibujo tecnico, pero hecho desde cero para GIAE.

Trabajo principal:

- Crear formato interno de plano electrico GIAE: capas, simbolos, circuitos, tableros, canalizaciones, cotas y metadatos.
- Soportar importacion/exportacion hacia formatos de intercambio cuando sea legal y tecnicamente posible.
- No copiar AutoCAD ni su codigo, interfaz, nombres internos ni logica propietaria.
- Dise?ar herramientas propias: muro/referencia, canalizacion, circuito, tablero, simbolo, carga, tierra, leyenda y revision.
- Conectar el plano con los motores: una carga dibujada debe alimentar calculos; un circuito calculado debe poder aparecer en el plano.
- Validar plano contra RIC, DS8 y reglas internas.

Criterio de salida:

- GIAE puede crear y revisar planos electricos basicos.
- El plano deja de ser solo dibujo: se vuelve una fuente de datos para calculo y auditoria.

## Fase 6 - GIAE razonador tecnico 2.0

Meta: que GIAE razone como asistente tecnico verificable, no como generador de texto.

Trabajo principal:

- Crear nucleo de razonamiento con pasos auditables.
- Cada conclusion debe mostrar evidencia, reglas, calculos, dudas y acciones.
- Incorporar memoria de proyecto: decisiones, cambios, mediciones, fotos, documentos y versiones.
- Crear preguntas inteligentes cuando falte informacion.
- Comparar alternativas tecnicas: costo, seguridad, normativa, materiales, plazo y riesgo.
- Separar recomendacion, advertencia, bloqueo y validacion final.
- Preparar modo instalador, modo ingeniero y modo estudiante.

Criterio de salida:

- GIAE puede explicar por que recomienda algo.
- GIAE reconoce cuando no sabe o cuando falta una medicion.
- GIAE ayuda a trabajar como instalador o ingeniero autorizado, pero no suplanta responsabilidad profesional ni autoridad SEC.
