# Fase 5.6 - Flujo maestro guiado GIAE

## Objetivo

Convertir GIAE desde una coleccion de modulos hacia un asistente tecnico que guia el proyecto de principio a fin.

El flujo oficial es:

```text
Proyecto -> Cliente -> Datos tecnicos -> Cargas -> Cuadro de carga -> Tablero -> Puesta a tierra -> Empalme -> Plano CAD -> Unilineal -> Documentacion SEC -> Auditoria -> Presupuesto -> Exportacion
```

## Los 6 puntos creados

1. Motor de flujo: `core/workflow/guidedWorkflowEngine.js`.
2. Etapas oficiales: `data/workflow/guided-flow.json`.
3. Estados, bloqueos y advertencias: `completado`, `observado`, `pendiente`, `bloqueado`, `revisable`.
4. Conexion con modulos existentes mediante `currentProject.guidedWorkflow`.
5. Pantalla Estado del Proyecto: `modules/flujo-guiado/flujo-guiado.js`.
6. Reporte de faltantes exportable desde el modulo.

## Regla central

GIAE no debe decir que un proyecto esta aprobado. Debe decir si esta completo, observado, bloqueado o si requiere revision profesional.

## Limite honesto

Este flujo No reemplaza al instalador autorizado, al ingeniero responsable, a la SEC ni a la distribuidora. Su funcion es guiar, prevalidar, ordenar evidencia, detectar faltantes y proponer acciones.

## Resultado esperado

El usuario puede abrir Flujo guiado y ver:

- etapa actual;
- avance del flujo;
- bloqueos;
- observaciones;
- siguiente accion;
- acceso directo al modulo que debe corregir;
- reporte JSON de faltantes.