# Plan Detallado - Frontend (Angular 21.2.9 + TailwindCSS 4)

**Fecha:** 21 de abril de 2026

## Tecnologías
Angular 21 (Standalone Components + Signals)
TailwindCSS 4 + DaisyUI (para UI rápida y moderna)
Reactive Forms + FormArray para subtareas dinámicas
HttpClient + Interceptors

## Componentes clave
TaskListComponent (paginación + búsqueda)
TaskFormComponent (modal reusable)
TaskDetailComponent (checkboxes dinámicos)
DashboardComponent (pendientes + alertas)

## Flujo
Servicios HTTP contra backend
Estado global con Signals
Responsive + UX clara (colores por estado, badges de vencimiento)

## Estado de avance frontend
- [x] Configuración base (Angular standalone, app config, rutas lazy, environments y TailwindCSS 4)
- [x] Capa Data Access + actualización de `TaskStore` con Signals (CRUD, toggle de subtareas, consultas pending/overdue)
- [x] Sub-fase UI: `tasks-list.component` funcional (filtros, búsqueda debounce, paginación, badges y acciones rápidas)
- [x] Sub-fase UI: `task-form.component` reusable (create/edit con Typed Reactive Forms + FormArray)
- [x] Sub-fase UI: `task-detail.component` funcional (detalle completo, progreso y checkboxes de subtareas)
- [x] Sub-fase UI: `dashboard.component` funcional (home con pendientes, alertas de vencidas y accesos rápidos)
- [x] Implementación de componentes funcionales (`TaskListComponent`, `TaskFormComponent`, `TaskDetailComponent`, `DashboardComponent`)
- [x] Frontend funcional completo (Fase 2 cerrada: CRUD UI + alertas + pendientes + navegación principal)
- [x] Integración HTTP completa con backend + manejo de errores en UI
- [x] Ajustes finales de UX, accesibilidad y pruebas

## Cierre de fases
- [x] **Fase 2 - Frontend** completada.
- [x] **Fase 3 - Integración** completada.
- [x] **Proyecto frontend 100% FINALIZADO**.

## Buenas Prácticas y Optimizaciones del Frontend

### Buenas prácticas generales de desarrollo (Angular 21)
- Uso exclusivo de **Standalone Components** como base de la arquitectura UI.
- **Signals** como estrategia principal de state management, evitando NgRx o servicios con `BehaviorSubject` cuando no aporten valor real.
- **Typed Reactive Forms** con `FormArray` para subtareas dinámicas, manteniendo tipado estricto en validaciones y payloads.
- Aplicar `ChangeDetectionStrategy.OnPush` en componentes de presentación y contenedores donde corresponda.
- Mantener una estructura de carpetas limpia y escalable: `core`, `features/tasks`, `shared`, `ui`, `layouts`, `models`, `services`.
- Dentro de cada feature (p. ej. `features/tasks`), separar **UI presentacional** en `ui/<nombre-componente>/` (componente + template + estilos), dejar **`data-access/`** y **`pages/`** en la raíz del feature y rutas en `tasks.routes.ts`, alineado a enfoque feature-first y Angular 21 (refactor aplicado 21 abr 2026).

### Solución de problemas de performance
- Usar `computed()` para derivaciones de estado y memoización de cálculos frecuentes.
- Usar `effect()` solo para efectos secundarios explícitos (persistencia, logging, sincronización externa), evitando lógica de negocio acoplada.
- Evitar suscripciones RxJS innecesarias en componentes; priorizar lectura reactiva con Signals.
- Definir `trackBy` en listas renderizadas (`*ngFor`) para minimizar recreación de nodos y repintados.
- Evitar detección de cambios innecesaria desacoplando estado local, UI derivada y eventos de usuario.

### Aplicación correcta de Lazy Loading
- Configurar rutas lazy con `loadComponent` para vistas standalone y `loadChildren` para módulos/agrupaciones de rutas grandes.
- Usar `@defer` (deferrable views) en componentes pesados o secundarios (gráficas, paneles, modales complejos).
- Definir una preloading strategy adecuada (por ejemplo, selectiva por prioridad de uso) para equilibrar TTI y navegación fluida.
- Priorizar carga inicial mínima del shell principal y diferir funcionalidades no críticas.

### Estructura clara para Signals
- Definir arquitectura de **Signal Store / Signal Services** para separar estado global y estado por feature.
- Separar explícitamente: señales de estado (`signal`), señales derivadas (`computed`) y efectos (`effect`).
- Evitar mezclar llamadas HTTP, mutaciones y efectos visuales en el mismo bloque reactivo.
- Estructura recomendada para esta app:
  - `TaskStore`: estado global de tareas, filtros, paginación y loading/error.
  - `TaskFormState`: estado local del formulario de creación/edición.
  - `TaskListViewState`: estado de presentación (orden, vista, expansión de elementos).

### Optimización de CSS / TailwindCSS 4
- Configurar correctamente TailwindCSS 4 con rutas `content` completas para purga efectiva de clases no utilizadas.
- Organizar estilos con capas (`@layer base`, `@layer components`, `@layer utilities`) para mantener consistencia y escalabilidad.
- Usar clases utilitarias de forma eficiente y considerar componentes de diseño reutilizables (daisyUI opcional, recomendado para acelerar UI consistente).
- Evitar estilos inline y CSS duplicado; centralizar tokens visuales (espaciado, tipografía, colores, radios).
- Definir estrategia de temas y `dark mode` si aplica desde etapas tempranas para evitar deuda de diseño.
- Validar optimización del bundle CSS final en cada release (sin clases huérfanas ni estilos redundantes).