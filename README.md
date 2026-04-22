# TODO Tasks - Spring Boot + Angular

Aplicación full-stack para gestión de tareas y subtareas checkeables, con búsqueda, paginación, estados, pendientes y alertas de vencimiento.

## Stack utilizada

- Backend: `Java 25 (LTS)` + `Spring Boot 4.0.5`
- Frontend: `Angular 21.2.x` (Standalone + Signals) + `TailwindCSS 4` + `daisyUI`
- Base de datos: `PostgreSQL 18` (Docker)
- Contenedores: `Docker` + `Docker Compose`

## Ejecución recomendada (Docker Compose)

Comando único recomendado:

```bash
docker compose up --build
```

Servicios expuestos por defecto:

- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend API: [http://localhost:8080](http://localhost:8080)
- PostgreSQL: `localhost:5432`

Para detener:

```bash
docker compose down
```

## Ejecución local (sin Docker Compose)

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend local (dev server): [http://localhost:4200](http://localhost:4200)

## Estructura del repositorio

- `.plan/` - evidencia de uso de IA, roadmap y prompts
- `backend/` - API REST con Spring Boot
- `frontend/` - aplicación Angular
- `docker-compose.yml` - orquestación de `db + backend + frontend`
- `.env` - variables de entorno para Docker Compose

## Flujos principales para pruebas

1. Crear tarea con subtareas dinámicas.
2. Editar tarea (incluyendo subtareas existentes/nuevas).
3. Cambiar estado de tarea y validar badges.
4. Marcar/desmarcar subtareas desde listado y detalle.
5. Buscar y filtrar tareas por estado/pendientes/vencidas.
6. Ver dashboard con:
   - tareas pendientes de ejecución
   - alertas de tareas vencidas
7. Eliminar tarea y validar refresco de vistas.

## Evidencia de uso de IA

Toda la evidencia de decisiones, prompts y plan de implementación está en:

- `.plan/plan-general.md`
- `.plan/plan-backend.md`
- `.plan/plan-frontend.md`
- `.plan/prompts-backend.md`
- `.plan/prompts-frontend.md`

## Estado del plus Docker

Plus opcional de Docker completado:

- Backend dockerizado
- Frontend dockerizado con build de producción en Nginx
- Base de datos PostgreSQL en contenedor
- Orquestación integral con `docker compose up --build`
