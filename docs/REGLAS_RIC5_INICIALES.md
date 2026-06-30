# GIAE Chile v1.0 — Etapa 3.0.2c
## Reglas RIC 5 iniciales

Este paquete incorpora reglas iniciales de ingeniería derivadas del **RIC N°05: Medidas de protección contra tensiones peligrosas y descargas eléctricas**.

## Alcance

- Contacto directo.
- Contacto indirecto.
- Tensiones de seguridad.
- Protectores diferenciales.
- Esquemas TN, TT e IT.
- Corte automático de la alimentación.
- Medidas clase A y clase B.
- Condiciones IP básicas para envolventes/barreras.

## Archivos agregados

```text
data/rules/ric/ric5/reglas-ric5-inicial.json
```

Además, las reglas fueron integradas al manifiesto combinado:

```text
data/rules/ric/rules.json
```

## Cantidad de reglas

- Reglas RIC 5 iniciales: **53**

## Principio de implementación

No se copian textos completos del RIC. Cada regla contiene:

- ID único.
- Nombre.
- Condición ejecutable o manual.
- Mensajes de cumplimiento/no cumplimiento.
- Acción recomendada.
- Referencia al apartado normativo.
- Historial y versión.

## Estado

Paquete inicial preparado para alimentar el futuro **Motor de Protecciones** y la auditoría normativa de seguridad eléctrica.
