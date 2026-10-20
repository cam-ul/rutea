# RUTEA — Descubre nuevos lugares, crea tu ruta

**RUTEA** es una plataforma web frontend responsive diseñada para acompañar a viajeros independientes durante las primeras etapas de planificación de un viaje: desde la exploración y descubrimiento de nuevos destinos hasta la organización de una ruta personal por día en un mismo entorno digital.

 **Demo desplegada en vivo:** [https://rutea-seven.vercel.app/](https://rutea-seven.vercel.app/)  
 **Video de presentación:** [Ver en YouTube](https://youtu.be/HtLxeFrF3qs)  
 **Repositorio:** [https://github.com/cam-ul/rutea](https://github.com/cam-ul/rutea)

---

## Problemática y Propósito

La planificación inicial de un viaje suele fragmentarse en múltiples plataformas: un sitio para buscar destinos, otro para revisar el clima y aplicaciones de notas para guardar lugares o armar itinerarios. 

**RUTEA** centraliza en una sola mesa de trabajo:
- **Exploración de destinos** con búsqueda y filtrado por región geográfica.
- **Fichas técnicas y climáticas** (capital, población, idioma, moneda, coordenadas y pronóstico meteorológico).
- **Colección de favoritos** evitando registros duplicados mediante persistencia local.
- **Planificador de rutas** organizadas por destino, fechas, presupuesto, número de viajeros y actividades por día.

---

## Arquitectura del Proyecto (Estructura Multipágina)

El proyecto está construido con **HTML5 semántico** y **CSS3 modular** (Variables CSS, Flexbox y CSS Grid), organizado en vistas independientes para facilitar su mantenimiento y escalabilidad:

```text
rutea-app/
├── index.html            # Inicio: Hero, buscador, destinos destacados, pasos y recomendador
├── explorar.html         # Explorador: Filtros por región, grid de destinos y estado vacío
├── detalle-destino.html  # Ficha de destino: Datos geográficos de Portugal y clima en Lisboa
├── favoritos.html        # Favoritos: Colección personal guardada y estado sin registros
├── mi-ruta.html          # Planificador: Listado de rutas creadas con fechas y presupuesto
├── detalle-ruta.html     # Itinerario: Línea de tiempo día a día y clima previsto
├── crear-ruta.html       # Formulario: Creación y edición de rutas de viaje
├── acerca.html           # Acerca de RUTEA: Qué resuelve, qué no es y público objetivo
├── perfil.html           # Perfil: Métricas de destinos y rutas conservadas en el navegador
└── styles.css            # Hoja de estilos global documentada por módulos y responsive