# Vision GIAE 2.0 - CAD, documentos y razonamiento

## Idea central

GIAE 2.0 debe ser una plataforma tecnica capaz de razonar sobre proyectos electricos. No debe ser solo un formulario ni solo una calculadora.

Debe unir cuatro mundos:

- Proyecto activo.
- Calculos electricos.
- Documentos y normativa.
- Plano electrico inteligente.

## CAD electrico propio

El CAD de GIAE debe ser propio y limitado al dominio electrico. Puede entender flujos de trabajo usados en dibujo tecnico, pero no debe copiar AutoCAD ni depender de su codigo propietario.

Capacidades esperadas:

- Dibujar circuitos, tableros, cargas, canalizaciones, puestas a tierra, simbolos y leyendas.
- Usar capas electricas: alumbrado, enchufes, fuerza, canalizacion, tablero, tierra, notas, revision.
- Conectar simbolos con datos reales del proyecto.
- Generar cuadro de carga desde el plano.
- Detectar cargas sin circuito, circuitos sin proteccion, tableros sin tierra y planos sin leyenda.
- Exportar formatos abiertos o documentados cuando sea legal y necesario.

## Lectura y entendimiento de documentos

GIAE debe leer documentos para evaluarlos, no para copiarlos.

Documentos objetivo:

- Decreto Supremo N8 y RIC.
- Memorias tecnicas.
- Informes de medicion.
- Cotizaciones.
- Fotos y evidencias de terreno.
- Planos PDF o imagen.
- Respaldo .giae.

Flujo esperado:

1. Identificar tipo de documento.
2. Extraer metadatos basicos.
3. Detectar datos tecnicos relevantes.
4. Comparar contra proyecto activo.
5. Marcar inconsistencias.
6. Proponer acciones.
7. Guardar evidencia y trazabilidad.

## Razonamiento verificable

GIAE debe razonar con estructura:

- Entrada: dato recibido.
- Contexto: proyecto, norma, modulo y documento.
- Supuesto: si falta un dato, declararlo.
- Regla: fuente y apartado referencial.
- Calculo: formula o criterio usado.
- Resultado: valor, estado y confianza.
- Accion: que debe hacer el usuario.
- Bloqueo: que impide validar.

Regla clave:

Si falta evidencia, GIAE no inventa. Pregunta, bloquea o deja el estado como requiere revision.

## Responsabilidad profesional

GIAE puede ayudar a trabajar como instalador o ingeniero autorizado, pero no reemplaza al profesional competente, a la SEC ni a la distribuidora.

La meta es aumentar calidad, orden, trazabilidad y seguridad, no emitir una aprobacion automatica sin respaldo.
