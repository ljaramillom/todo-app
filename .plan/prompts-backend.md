# Prompts utilizados para el Backend

**Prompt 1 - Estructura general**  
"Actúa como arquitecto Spring Boot experto. Genera la estructura completa de un proyecto TODO Tasks con Java 25 + Spring Boot 4.0.5, PostgreSQL, entidades Task y Subtask..."

**Prompt 2 - Entidades y modelo de datos**  
"Genera las entidades JPA para Task y Subtask con todos los requisitos de la prueba técnica (estados, fecha ejecución, subtareas checkeables, cascade, timestamps). Incluye enum TaskStatus."

**Prompt 3 - Repositorios y Specification**  
"Crea un TaskRepository con soporte para paginación, búsqueda por título/descripción/estado y filtro de tareas pendientes/vencidas."

**Prompt 4 - Capa DTOs (Request/Response) — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: entidades `Task`/`Subtask`/`TaskStatus` en `com.todoapp.domain.model`, `pom.xml` mínimo Spring Boot 4.0.5 + Java 25 + JPA + Validation + PostgreSQL + Lombok.  
Instrucciones: continuar el backend en orden (DTOs → MapStruct → Repository → Service → Exception Handler → `application.yml`); tras cada paso actualizar `prompts-backend.md` y `plan-backend.md`; paquete base `com.todoapp`; buenas prácticas Spring Boot 4 (records en DTOs si aplica).  
**Sub-fase ejecutada en esta entrada:** solo DTOs; avisar al terminar cada sub-fase.  
Cierre explícito del prompt: *"Comienza ahora generando los DTOs y avísame cuando termines cada sub-fase para continuar."*

**Prompt 5 - MapStruct Mappers — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: entidades en `com.todoapp.domain.model`; DTOs en `com.todoapp.api.dto`; paquete base `com.todoapp`.  
Instrucciones: implementar capa MapStruct 1.6.0 en `com.todoapp.mapper` con `TaskMapper` (Task ↔ TaskResponse, CreateTaskRequest → Task, UpdateTaskRequest → Task con upsert de subtareas, listas) y `SubtaskMapper` si aplica; `@Mapper(componentModel = "spring", uses = {SubtaskMapper.class})`; buenas prácticas Spring Boot 4; uso de `addSubtask`/`removeSubtask`; tras completar, actualizar `prompts-backend.md` y `plan-backend.md`.  
Cierre explícito del prompt: *"Comienza ahora generando los mappers MapStruct."*

**Prompt 6 - TaskRepository + TaskSpecification — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: entidades en `com.todoapp.domain.model`; DTOs y `TaskListQueryParams` en `com.todoapp.api.dto`; mappers MapStruct en `com.todoapp.mapper`; `pom.xml` con MapStruct processor.  
Instrucciones: `TaskRepository` en `com.todoapp.repository` extendiendo `JpaRepository<Task, Long>` y `JpaSpecificationExecutor<Task>`; `TaskSpecification` con `toSpecification(TaskListQueryParams)` (LIKE insensible a mayúsculas en título/descripción, filtro `status`, `overdue` = PROGRAMADO + `executionDate` ≤ now, `pendingOnly` = PROGRAMADO o EN_EJECUCION, combinación AND), orden por `executionDate` ASC por defecto, CriteriaBuilder, `Pageable`; actualizar evidencia en `prompts-backend.md` y `plan-backend.md`.  
Cierre explícito del prompt: *"Comienza ahora generando el TaskRepository y TaskSpecification."*

**Prompt 7 - TaskService (capa Service) — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: entidades, DTOs, mappers MapStruct, `TaskRepository` + `TaskSpecification` con filtros y paginación.  
Instrucciones: `TaskService` en `com.todoapp.service` como `@Service` con `@Transactional` / `@Transactional(readOnly = true)`; inyección `TaskRepository` + `TaskMapper`; CRUD con DTOs (`createTask`, `updateTask`, `deleteTask`, `getTaskById`, `getAllTasks` paginado); `updateStatus` con transiciones; `findOverdueScheduledTasks` y `findPendingTasks` (tiempo real, sin scheduler); `EntityNotFoundException` donde aplique; actualizar `prompts-backend.md` y `plan-backend.md`.  
Cierre explícito del prompt: *"Comienza ahora generando el TaskService."*

**Prompt 8 - Global Exception Handler + application.yml — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: capas dominio, DTOs, mappers, repository, service en `com.todoapp`.  
Instrucciones: `GlobalExceptionHandler` en `com.todoapp.exception` con `@ControllerAdvice`/`RestControllerAdvice`; mapeo `EntityNotFoundException`→404, `IllegalStateException`→400, validación (`MethodArgumentNotValidException`, `ConstraintViolationException`)→400 con detalles, `Exception`→500; respuestas `ApiErrorResponse` en español; `application.yml` con PostgreSQL vía variables de entorno (Docker), `ddl-auto=update` desarrollo, dialecto Hibernate, `show-sql` según perfil, `server.port=8080`, `spring.application.name=todo-backend`; perfiles dev/prod opcionales; actualizar evidencia.  
Cierre explícito del prompt: *"Comienza ahora generando el Global Exception Handler y el application.yml."*

**Prompt 9 - REST Controllers — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: dominio, DTOs, mappers, repository, `TaskService`, `GlobalExceptionHandler`, `application.yml`, paquete `com.todoapp`.  
Instrucciones: `TaskController` en `com.todoapp.controller` con `/api/tasks` (listado paginado + query params, CRUD, `PATCH .../status` con `PatchTaskStatusRequest`); `SubtaskController` o integración para `PATCH /api/subtasks/{id}/toggle`; inyección `TaskService`; `@Valid`; `ResponseEntity` con 201/200/204; excepciones vía handler global; CORS opcional; actualizar evidencia; siguiente paso anotado: Docker Compose backend + tests básicos.  
Cierre explícito del prompt: *"Comienza ahora generando los controladores REST (TaskController y SubtaskController)."*

**Prompt 10 - Docker Compose backend + tests básicos — 21 de abril de 2026**  
Referencia: `@.plan/plan-general.md`, `@.plan/plan-backend.md`, `@.plan/prompts-backend.md`, `@.plan/data-model.md`, `@.plan/api-spec.md`.  
Estado confirmado: backend Spring Boot completo (entidades, DTOs, mappers, repository, services, exception handler, `application.yml`, controllers, `TodoApplication`).  
Instrucciones: `backend/Dockerfile` multi-stage Maven + Java 25, optimizado producción (jar en capas); actualizar `docker-compose.yml` con servicio `backend` (build `./backend`, `depends_on` db con `service_healthy`, variables `.env` `SPRING_DATASOURCE_*`, puerto 8080, restart); `docker compose up --build` funcional; tests básicos (`@SpringBootTest` y/o `@WebMvcTest`, H2 o perfil test); actualizar evidencia; backend listo para frontend o pruebas finales.  
Cierre explícito del prompt: *"Comienza ahora generando el Dockerfile, actualizando docker-compose.yml y los tests básicos."*

## Nota de cierre backend
Backend completado y validado como parte del cierre integral del proyecto.  
El backend queda integrado con frontend y docker-compose completo en la fase final.

(Continuaré agregando aquí cada prompt importante que usemos a medida que avancemos)