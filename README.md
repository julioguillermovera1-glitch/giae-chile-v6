# GIAE Chile v1.0 - Base original

Base inicial modular para una plataforma de cálculo, documentación, presupuesto y auditoría de instalaciones eléctricas en Chile.

## Estado

Prototipo estructural original. No es una versión normativa final ni certifica proyectos eléctricos.

## Principios

- Cada módulo es independiente.
- La plataforma no es una página larga: funciona con ventanas internas.
- El código se crea desde cero para evitar plagio.
- Los módulos técnicos deben validarse antes del lanzamiento v1.0.

## Perfiles previstos

- Instalador independiente
- Empresa
- Estudiante

## Módulos base

- Proyecto
- Usuarios
- Cargas
- Cuadro de carga
- Empalme
- Puesta a tierra
- Documentación
- Presupuesto
- Auditoría
- Educación


## Actualización módulo Unilineal

Se incorpora un módulo independiente de unilineal automático. Genera una imagen SVG original según las cargas registradas en el cuadro de carga y permite descargar o imprimir el diagrama.


## Actualización módulos técnicos

- Unilineal independiente con trazado SVG automático adaptado a cargas/cuadro de carga.
- Puesta a tierra independiente con cálculo preliminar automático, guardado en proyecto y descarga de informe.
- Ambos módulos mantienen separación funcional y no modifican otros módulos sin acción del usuario.
