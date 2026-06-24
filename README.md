# GIAE Chile v2.3.1 - Tierra Automática

Creado por Julio Vera Concha.

## Base
Se parte desde GIAE Chile v2.3.0 Tierra Inteligente.

## Regla
No se modifican Proyecto, Cargas, Cuadro, Unilineal ni Empalme.
Se mejora únicamente el módulo Tierra.

## Mejora principal
El módulo Tierra ahora recomienda automáticamente una solución inicial según:
- Potencia demandada.
- Tipo de empalme.
- Tipo de suministro.
- Distribuidora.
- Datos guardados del módulo Empalme.

## Recomendaciones automáticas
- Baja demanda: jabalina simple.
- 10 a 25 kW: jabalinas múltiples en paralelo.
- 25 a 50 kW: múltiples electrodos y conductor TP reforzado.
- Sobre 50 kW o empalme indirecto: evaluar malla de tierra.
- COPELEC: mínimo sugerido reforzado y observaciones constructivas.
- CGE: observación de set fotográfico.
- SAESA / FRONTEL: consideración de mayor resistividad rural.

## Mantiene
- TP IEC 60417-5019.
- TS IEC 60417-5018.
- Equipotencialidad IEC 60417-5021.
- Sistema existente.
- Resistencia medida.
- Validación RIC 6.
- Informe automático.
- Guardar y continuar a Carpeta Técnica.
