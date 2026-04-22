# Prompts utilizados para el Frontend

## Prompt 1 - Configuración Inicial y Buenas Prácticas (21 abr 2026)

Referencia obligatoria para todos los prompts futuros del frontend (Angular 21.2.9 + TailwindCSS 4):

- Arquitectura basada exclusivamente en **Standalone Components**.
- **Signals-first** para manejo de estado (global y local), evitando NgRx o `BehaviorSubject` cuando no sea estrictamente necesario.
- Uso de **Typed Reactive Forms** y `FormArray` para flujos dinámicos de subtareas.
- Aplicación de `ChangeDetectionStrategy.OnPush` y prevención de detección de cambios innecesaria.
- Performance por diseño: uso correcto de `computed()` y `effect()`, evitar suscripciones innecesarias y definir `trackBy` en `*ngFor`.
- Lazy loading agresivo y bien planificado con `loadComponent`, `loadChildren` y `@defer` para vistas pesadas.
- Definir preloading strategy acorde al uso real de la app para mejorar tiempos de navegación.
- Estructura clara de Signals Store/Services separando `signal` (estado), `computed` (derivados) y `effect` (efectos secundarios).
- Estructura escalable de carpetas (`core`, `features/tasks`, `shared`, `ui`, etc.).
- TailwindCSS 4 optimizado: rutas de `content` correctas, uso de `@layer`, purga efectiva, sin estilos inline ni CSS duplicado.
- Definir estrategia de temas y `dark mode` (si aplica), y controlar el tamaño final del bundle CSS.

Este prompt funciona como estándar base y debe considerarse antes de implementar cualquier componente, vista, store o estilo del frontend.

**Prompt 1 - Configuración Angular**  
"Genera el proyecto Angular 21 con TailwindCSS 4, standalone components, estructura limpia para una app TODO Tasks."

**Prompt 2 - Configuración Inicial del Proyecto Angular (21 abr 2026)**  
"Genera la configuración inicial completa del proyecto Angular 21.2.9 + TailwindCSS 4, respetando standalone components, arquitectura Signals con TaskStore, ChangeDetectionStrategy.OnPush, lazy loading con loadComponent/loadChildren/@defer, configuración de environments, trackBy y optimización de bundle CSS."

**Prompt 3 - Formulario dinámico**  
"Crea un reactive form en Angular con FormArray para agregar/eliminar ítems checkeables de forma dinámica."

**Prompt 4 - Componente de lista**  
"Desarrolla un TaskListComponent con paginación, búsqueda en tiempo real y badges de estado + alerta de tareas vencidas."

**Prompt 5 - Data Access + TaskStore (21 abr 2026)**  
"Implementa la capa Data Access del módulo tasks con un servicio HttpClient tipado contra `/api/tasks` y `/api/subtasks`, y actualiza TaskStore con Signals para `loadTasks`, `createTask`, `updateTask`, `deleteTask`, `toggleSubtask`, `findPending` y `findOverdue`, manteniendo enfoque Signals-first y manejo de estado reactivo."

**Prompt 6 - tasks-list.component (21 abr 2026)**  
"Implementa `tasks-list.component` con `ChangeDetectionStrategy.OnPush`, integración completa con `TaskStore` usando Signals (`tasks`, `loading`, `page`, `totalPages`, contadores pending/overdue), búsqueda en tiempo real con debounce vía `effect`, filtros por estado/pending/overdue, badges de estado, alerta overdue, acciones rápidas (detalle, edición placeholder, eliminar, cambio de estado, toggle de subtareas), `trackBy`, `@defer`, UI responsive con TailwindCSS 4 + daisyUI e integración en `tasks-shell.page`."

**Prompt 7 - task-form.component (21 abr 2026)**  
"Implementa `task-form.component` reusable (create/edit) como standalone con `Typed Reactive Forms` + `FormArray` dinámico de subtareas, validaciones alineadas a DTOs backend, integración con `TaskStore` (`createTask`, `updateTask`, `loadTaskById`), `ChangeDetectionStrategy.OnPush`, manejo interno con Signals (`open`, `taskId`, `submitting`, `loadingTask`), UI modal con TailwindCSS 4 + daisyUI, y conexión desde `tasks-list.component` para alta/edición real."

**Prompt 8 - task-detail.component (21 abr 2026)**  
"Implementa `task-detail.component` standalone reusable (modal) con `ChangeDetectionStrategy.OnPush`, integración con `TaskStore` (`loadTaskById`, `toggleSubtask`, `updateTask`, `deleteTask`), visualización completa de la tarea (incluyendo badges de estado y overdue, timestamps, progreso de subtareas), lista completa de subtareas con checkboxes funcionales (`trackBy` + `@defer`), y conexión desde `tasks-list.component` para abrir detalle, editar desde detalle y reflejar eliminaciones."

**Prompt 9 - dashboard.component (21 abr 2026)**  
"Implementa `dashboard.component` como ruta principal (`/`) con `ChangeDetectionStrategy.OnPush`, consumo Signals de `TaskStore` (`pendingTasks`, `overdueTasks`, conteos y total), secciones de alertas overdue y pendientes de ejecucion con `@defer` + `trackBy`, acciones directas (nueva tarea, ver todas, detalle), UI con TailwindCSS 4 + daisyUI, e integración de routing para que el listado completo quede en `/tasks`."

**Prompt 10 - Finalización del proyecto (Layout + Docker + README) - 21 abr 2026**  
"Cierra el proyecto con un layout global reusable (`app-layout`) con navegación principal y acceso rápido a nueva tarea; actualiza Docker Compose para ejecutar `db + backend + frontend` en producción (frontend servido con Nginx); crea README profesional con stack, ejecución y flujos de prueba; y actualiza evidencia `.plan` marcando fases finales como completadas y proyecto 100% finalizado."

(Más prompts se irán agregando aquí durante el desarrollo)