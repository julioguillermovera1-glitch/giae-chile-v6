# GIAE Chile v1.0 - Registro de etapas

## Etapa 1 - Arquitectura general
Estado: Terminada.

Definiciones aprobadas:
- Plataforma modular.
- Perfiles: Administrador, Empresa, Instalador independiente, Estudiante y Aula Técnica.
- Autoría: Julio Guillermo Vera.
- Normativa autorizada: RIC, IEC eléctrica aplicable y DS N°8 de Chile.
- Regla estricta: no inventar datos si no existe respaldo normativo.

## Etapa 2.1 - Pantalla de inicio profesional
Estado: Terminada en este paquete.

Incluye:
- Portada sobria, sin iconos innecesarios.
- Accesos por perfil.
- Aula Técnica con acceso libre.
- Pie oficial de autoría.
- Barra inferior en plataforma con estado del proyecto y autoría.
- Logo base tipo monograma, no generado con aspecto de IA.

Siguiente etapa sugerida:
- Etapa 2.2: Dashboard por perfil.


## Etapa 2.2 - Dashboard por perfil
Estado: Terminada en este paquete.

Incluye:
- Dashboard inicial por perfil.
- Panel administrador con usuarios conectados, usuarios registrados, módulos activos y estado normativo.
- Panel empresa con accesos a proyecto, trabajadores, presupuestos y documentación.
- Panel instalador independiente con accesos a proyecto, cargas, unilineal y presupuesto.
- Panel estudiante con continuidad de aprendizaje y práctica.
- Panel Aula Técnica con acceso libre, sin pago ni registro obligatorio.
- Accesos rápidos conectados a módulos existentes.

Siguiente etapa sugerida:
- Etapa 2.3: Menú lateral profesional agrupado por áreas.

## Etapa 2.3 - Menú lateral agrupado por áreas
**Estado:** Terminada

Cambios incorporados:
- Menú lateral organizado por áreas: Inicio, Proyecto, Ingeniería, Documentación, Educación y Administración.
- Los grupos solo muestran módulos permitidos según el perfil activo.
- Se mantiene la independencia de módulos.
- Se evita mostrar demasiados botones sueltos en pantalla.

## Etapa 2.4 - Sistema de ventanas internas
Estado: Terminada.

Cambios:
- Los módulos se abren como ventanas internas dentro del área de trabajo.
- Cada ventana tiene barra de título, botón minimizar y botón cerrar.
- El menú activa ventanas ya abiertas en vez de recargar todo el escritorio.
- La impresión prioriza la ventana activa para evitar mezclar módulos.

Criterio de término:
- Un módulo puede abrirse, activarse, minimizarse y cerrarse sin cerrar sesión.

## Etapa 2.5 - Proyecto Activo
Estado: Terminada.

Se incorporó el Proyecto Activo como núcleo de datos compartido por los módulos de GIAE Chile v1.0.

Funciones agregadas:
- Identificador interno de proyecto.
- Datos generales, técnicos y comerciales en una sola ficha.
- Cálculo automático de potencia instalada y demanda estimada desde cargas registradas.
- Checklist automático de avance.
- Historial de cambios del proyecto.
- Exportación de archivo propio `.giae`.
- Importación de proyecto `.giae` desde el módulo Proyecto Activo.
- Barra inferior con estado del proyecto, avance y último guardado.

Regla de etapa:
Todos los módulos técnicos deberán leer y escribir datos mediante el Proyecto Activo, evitando duplicar información.

## Etapa 2.6 - Workspaces reales
Estado: Terminada.

Cambios:
- Los módulos ya no quedan como cambios de título sobre el mismo contenido.
- Solo el workspace activo queda visible en el área de trabajo.
- Se agregó barra de ventanas abiertas para activar módulos ya cargados.
- Se agregó contenido funcional al workspace Cargas, conectado al Proyecto Activo.
- Cargas actualiza potencia, cantidad, fase y tipo para alimentar cuadro, tierra, empalme y unilineal.
- Se corrigió el cálculo de potencia total considerando cantidad por carga.

Criterio de cierre:
Al seleccionar un botón del menú lateral, debe abrirse o activarse el módulo correspondiente, no solo cambiar el encabezado.


## Etapa 2.7 - Administrador de Proyectos
Estado: terminada.
- Biblioteca local de proyectos.
- Importación/exportación `.giae`.
- Duplicar, renombrar, archivar y eliminar proyectos.
- Preparación documental para Cloudflare D1/R2.

## Etapa 2.8 - Estado del software e Inspector
Estado: completada.

Se agrega al panel Administrador una sección exclusiva para revisar el estado real local del software y un Inspector del Sistema. Esta herramienta permite revisar proyecto activo, almacenamiento local, módulos, sesión, configuración administrativa y descargar un reporte de diagnóstico. En producción, este panel deberá conectarse con Cloudflare Workers, D1 y R2 para mostrar estado real de nube, sincronización, licencias y usuarios conectados.


## Etapa 2.8b — Modo Desarrollador e Inspector de Originalidad

Estado: terminado.

Se agregó una herramienta interna visible solo para el perfil Administrador:

- Modo Desarrollador dentro del Panel Administrador.
- Inspector de Originalidad.
- Revisión local de duplicación interna.
- Detección de marcas de generación automática en comentarios.
- Revisión de referencias externas no documentadas.
- Detección de IDs HTML repetidos.
- Reporte JSON descargable.

Alcance: esta herramienta no confirma plagio contra toda internet. Funciona como control interno de calidad, originalidad, mantenimiento y dependencias.


## Etapa 2.9 - Biblioteca Técnica GIAE

Estado: terminada.

Se incorpora una biblioteca técnica interna reutilizable por los futuros motores de ingeniería, documentación, presupuesto, auditoría y Aula Técnica. La biblioteca contiene catálogos iniciales de conductores, protecciones termomagnéticas, diferenciales, canalizaciones, puesta a tierra, distribuidoras y documentos técnicos.

Regla principal: ningún dato debe aprobarse automáticamente si no cuenta con respaldo normativo cargado. En ese caso, GIAE debe marcar el resultado como pendiente o requiere revisión normativa.


## Etapa 2.9b - Base de Conocimiento GIAE
- Biblioteca Técnica evolucionada a Base de Conocimiento.
- Incluye buscador, filtros por categoría/estado/uso y ficha técnica por elemento.
- Mantiene regla de validación normativa estricta: RIC, IEC eléctrica aplicable y DS N°8 cuando corresponda.


## Etapa 3.0.1 — Motor Normativo GIAE
Estado: completada.

Se creó el núcleo del Motor Normativo preparado para reglas RIC, IEC eléctrica aplicable y DS N°8, sin cargar textos completos de normativa. Incluye esquema de reglas, cargador, evaluador, reportes, importador y panel de administración.

Regla central: GIAE no declara cumplimiento sin regla implementada, datos suficientes y referencia validada.


## Etapa 3.0.2a – Reglas RIC 4 iniciales
Estado: completada. Se incorporó paquete inicial de reglas de conductores, canalizaciones, materiales e identificación derivadas del RIC N°04.


## Etapa 3.0.2b - Reglas RIC 3 iniciales

Estado: completada.

Se incorporó el primer paquete de reglas derivadas del RIC N°03 para demanda, alimentadores, subalimentadores, caída de tensión, neutro monofásico, shaft vertical y simultaneidad de conjuntos de viviendas. Las reglas no reproducen el texto completo del pliego; quedan modeladas como criterios de ingeniería con referencia normativa y estado de validación.


## Etapa 3.0.2d — Reglas RIC 6 iniciales
Estado: Terminada. Se incorpora paquete inicial de Puesta a Tierra y Enlace Equipotencial.


## Etapa 4.0.1 - Motor de Cálculo de Cargas
Estado: terminado.
Incluye gestor de cargas, cálculo de demanda, corriente, balance de fases y salida de datos al Proyecto Activo.
