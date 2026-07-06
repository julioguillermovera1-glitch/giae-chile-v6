# Motor Normativo GIAE · Etapa 3.0.1

## Objetivo
Crear un motor robusto y preparado para evaluar reglas técnicas asociadas a RIC, IEC eléctrica aplicable y Decreto Supremo N8, sin copiar textos completos de normas dentro del software.

## Principio obligatorio
GIAE no inventa cumplimiento normativo. Si no existe regla implementada, datos suficientes o referencia validada, el resultado debe ser: requiere revisión normativa o información insuficiente.

## Componentes creados
- `core/normative/schema.js`: estructura y validación de reglas.
- `core/normative/ruleLoader.js`: carga reglas desde `data/rules/`.
- `core/normative/validator.js`: evalúa condiciones ejecutables.
- `core/normative/engine.js`: API interna del motor.
- `core/normative/reportGenerator.js`: genera reportes JSON.
- `modules/normativo/normativo.js`: panel administrador del Motor Normativo.
- `data/rules/ric`, `iec`, `ds8`, `personalizadas`: paquetes separados por fuente.

## Qué falta antes de cargar RIC oficialmente
1. Definir el primer paquete de reglas RIC para Cargas, Conductores y Protecciones.
2. Validar cada regla contra documentos oficiales vigentes.
3. Registrar documento, apartado, estado, versión y fecha de revisión.
4. Mantener las reglas como JSON versionados.

## Formato general de regla
Cada regla debe incluir ID, nombre, fuente, categoría, estado, referencia, entradas requeridas, condición, mensajes y acción recomendada.

## Autoría
Diseñado y desarrollado por Julio Guillermo Vera · © 2026 GIAE Chile. Todos los derechos reservados.
