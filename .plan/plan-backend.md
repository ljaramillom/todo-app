# Plan Detallado - Backend (Spring Boot 4.0.5 + Java 25)

**Fecha:** 21 de abril de 2026

## Tecnologías
Spring Boot 4.0.5 + Java 25
Spring Data JPA + PostgreSQL 18
Spring Web + Validation
MapStruct + Lombok
Dockerizado

## Tareas principales
- [x] Entidades JPA (Task y Subtask) con cascade y orphanRemoval
- [x] MapStruct: `SubtaskMapper` + `TaskMapper` (Spring, upsert subtareas)
- [x] Repositorios con Specification para búsqueda + paginación (`TaskRepository`, `TaskSpecification`)
- [x] Servicios con lógica de estados y alertas de tareas vencidas (`TaskService`)
- [x] REST Controllers (CRUD + endpoints específicos, `TaskController` + `SubtaskController`)
- [x] DTOs API (request/response, query de listado, payload de error)
- [x] Global Exception Handler (`GlobalExceptionHandler` + `ApiErrorResponse`)
- [x] Configuración de datasource / JPA (`application.yml` + variables de entorno)
- [x] Docker imagen backend (`backend/Dockerfile`) + `docker-compose` servicio `backend` + tests básicos (H2)

### Notas de avance
- **DTOs (completado):** capa `com.todoapp.api.dto` con records (requests/responses alineados a `api-spec.md` y modelo de datos). Incluye `TaskListQueryParams` para paginación (`page`/`size`), búsqueda `search`, filtros `status`/`overdue`/`pendingOnly` previstos para Specification. Subpaquete `com.todoapp.api.dto.error` con `ApiErrorResponse` listo para el handler global.
- **Mappers (completado):** `com.todoapp.mapper.SubtaskMapper` (interfaz) y `com.todoapp.mapper.TaskMapper` (clase abstracta + `InjectionStrategy.CONSTRUCTOR` para inyectar `SubtaskMapper`). MapStruct **1.6.0** y `lombok-mapstruct-binding` configurados en `pom.xml`. `TaskMapper` expone `toResponse`, `toResponseList`, `toEntity(CreateTaskRequest)` y `updateEntityFromRequest(UpdateTaskRequest, Task)` con sincronización de subtareas vía `addSubtask`/`removeSubtask`.
- **Repositorio (completado):** `com.todoapp.repository.TaskRepository` + `TaskSpecification.toSpecification(TaskListQueryParams)` con búsqueda LIKE (título o descripción, case-insensitive, escape de `%`/`_`), filtros `status`, `overdue` (PROGRAMADO + fecha ejecución vencida), `pendingOnly` (PROGRAMADO | EN_EJECUCION), combinación AND. Orden por defecto: `TaskSpecification.toPageable` → `Sort` por `executionDate` ASC.
- **Service (completado):** `com.todoapp.service.TaskService` — CRUD vía DTOs y `TaskMapper`; listado `Page<TaskResponse>` con `TaskSpecification` + `toPageable`; `updateStatus` con transiciones (PROGRAMADO→EN_EJECUCION|CANCELADA; EN_EJECUCION→FINALIZADA|CANCELADA; terminales sin cambios; mismo estado idempotente); alertas `findOverdueScheduledTasks` / `findPendingTasks` con consultas en tiempo real reutilizando `TaskSpecification` + `defaultSort()`.
- **Exception + configuración (completado):** `com.todoapp.exception.GlobalExceptionHandler` (`EntityNotFoundException`→404, `IllegalStateException`→400, `MethodArgumentNotValidException` / `HandlerMethodValidationException` / `ConstraintViolationException`→400 con detalles, `Exception`→500); `application.yml` con datasource desde `SPRING_DATASOURCE_*`, `ddl-auto` configurable, dialecto PostgreSQL, `open-in-view: false`, perfiles `dev` (show-sql) y `prod` (sin SQL en log).
- **Controllers (completado):** `com.todoapp.controller.TaskController` (`GET/POST/PUT/PATCH/DELETE` bajo `/api/tasks`, `@Valid` + `TaskListQueryParams` vía `@ModelAttribute`); `SubtaskController` con `PATCH /api/subtasks/{id}/toggle`. Soporte en servicio: `SubtaskRepository` + `SubtaskService.toggleSubtask`. Arranque: `com.todoapp.TodoApplication` + `spring-boot-maven-plugin`.
- **Docker + tests (completado):** `backend/Dockerfile` multi-stage (Maven Temurin 25 → JRE 25 Alpine) con **Spring Boot layered jar** (`layertools`); `docker-compose.yml` servicio `backend` (`build: ./backend`, `depends_on` db `service_healthy`, `env_file` + `SPRING_DATASOURCE_*`, perfil `prod`, puerto `${BACKEND_PORT:-8080}:8080`). Tests: perfil `test` + H2 (`application-test.yml`), `TodoApplicationTests`, `TaskControllerTest` (`@WebMvcTest` + `@MockitoBean`).

**Estado backend:** listo para integración con **frontend** y **pruebas finales** (E2E / despliegue).

## Cierre final
- [x] Backend integrado con frontend Angular.
- [x] Backend incluido en docker-compose completo (`db + backend + frontend`).
- [x] Backend 100% finalizado.

**Próximos pasos:** ~~Entidades~~ → ~~DTOs~~ → ~~Mappers~~ → ~~Repositorios~~ → ~~Services~~ → ~~Exception Handler + application.yml~~ → ~~Controllers~~ → ~~Docker Compose (backend) + Tests básicos~~ → Frontend / pruebas finales.