# RUTEA · Descubre nuevos lugares, crea tu ruta

**RUTEA** es un frontend multipágina estático (HTML, CSS y módulos JavaScript) responsive, pensado para acompañar a viajeros independientes en las primeras etapas de un viaje: explorar destinos y organizar una ruta personal por día en un mismo entorno digital.

El repo/despliegue del producto es solo HTML, CSS, `js/`, `assets/` y este README; `docs/`, npm y el resto del tooling son locales y no se suben. No hay bundler, build step ni backend propio: basta servir la raíz por HTTP.

 **Demo desplegada en vivo:** [https://rutea-seven.vercel.app/](https://rutea-seven.vercel.app/)  
 **Video de presentación:** [Ver en YouTube](https://youtu.be/HtLxeFrF3qs)  
 **Repositorio:** [https://github.com/cam-ul/rutea](https://github.com/cam-ul/rutea)

---

## Cómo ejecutarlo en local

Los módulos usan `type="module"` y rutas relativas, así que hay que servir la raíz del repo por **HTTP** (no abras las páginas con `file://`):

```bash
# Desde la raíz del repositorio
python3 -m http.server 8765
```

Luego abre [http://localhost:8765/](http://localhost:8765/). También vale Live Server u otro servidor HTTP estático.

---

## Problemática y Propósito

La planificación inicial de un viaje suele fragmentarse en múltiples plataformas: un sitio para buscar destinos, otro para revisar el clima y aplicaciones de notas para guardar lugares o armar itinerarios.

**RUTEA** centraliza en una sola mesa de trabajo:
- **Exploración de destinos** con búsqueda y filtrado por región geográfica.
- **Fichas técnicas y climáticas** (capital, población, idioma, moneda, coordenadas y pronóstico meteorológico).
- **Colección de favoritos** evitando registros duplicados mediante persistencia local.
- **Planificador de rutas** organizadas por destino, fechas, presupuesto, número de viajeros y actividades por día.

---

## Arquitectura del Proyecto (sitio multipágina estático)

Cada pantalla corresponde a un archivo HTML que carga `styles.css` y un entrypoint en **ES modules** (`js/pages/*.js`). Persistencia en **localStorage**; datos de país, clima y geocodificación vía APIs externas.

```text
rutea/
├── *.html                 # Cada pantalla = un archivo HTML
├── styles.css             # Tokens + módulos UI globales
├── assets/destinations/   # Fotos locales por código ISO (PT.jpg, …)
├── js/
│   ├── api/               # countries, weather, geocode
│   ├── media/             # resolución de imagen de destino
│   ├── pages/             # entrypoints por página
│   ├── storage/           # favorites, routes
│   ├── ui/                # toast
│   ├── i18n/es.js         # nombres país/capital en español
│   ├── recommend.js       # catálogo + scoring
│   └── utils.js           # skeletons, URLs, escape, formato
└── README.md
```

Vistas principales: `index.html`, `explorar.html`, `detalle-destino.html`, `favoritos.html`, `mi-ruta.html`, `detalle-ruta.html`, `crear-ruta.html`, `acerca.html`, `perfil.html`.

Los manuales y scripts de capturas/PDF viven en `docs/` solo en local (fuera del repo de producto).
