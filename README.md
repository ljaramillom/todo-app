# TODO Tasks - Spring Boot + Angular

Aplicación full-stack para la gestión de tareas diarias con subtareas checkeables, búsqueda, paginación, estados, visualización de pendientes y alertas de vencimiento.

**Desarrollada siguiendo estrictamente los requisitos de la prueba técnica.**

## Stack utilizada (abril 2026)

- **Backend**: Java 25 (LTS) + Spring Boot 4.0.5
- **Frontend**: Angular 21.2.9 (Standalone Components + Signals) + TailwindCSS 4 + daisyUI
- **Base de datos**: PostgreSQL 18
- **Contenerización**: Docker + Docker Compose

## 🚀 Ejecución recomendada (Docker Compose) - Método más rápido

1. Clona el repositorio:

   ```bash
   git clone https://github.com/ljaramillom/todo-app.git
   cd todo-app
   ```

2. Crea el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

3. Levanta toda la aplicación con un solo comando:

   ```bash
   docker compose up --build -d
   ```

4. Espera a que todos los servicios estén en estado **Up** (puede tardar 20-40 segundos la primera vez).

**URLs de acceso:**

- **Frontend (Angular):** http://localhost:4200
- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

Para detener todo:

```bash
docker compose down
```

## Ejecución local (sin Docker)

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

Frontend se ejecutará en: http://localhost:4200

## Estructura del repositorio

- `.plan/` -> Evidencia completa de uso de IA
- `backend/` -> API Spring Boot
- `frontend/` -> Aplicación Angular
- `docker-compose.yml` + `.env.example` -> Orquestación completa
- `README.md` -> Este archivo

**Nota:** El archivo `.env` está en `.gitignore` por seguridad y no se incluye en el repositorio.

## Flujos principales para probar

1. Accede al Dashboard -> verás alertas de tareas vencidas y pendientes.
2. Crea una tarea con subtareas dinámicas.
3. Edita la tarea (título, descripción, fecha, subtareas).
4. Cambia estados y marca/desmarca ítems checkeables.
5. Usa búsqueda, filtros y paginación en el listado.
6. Elimina una tarea y valida que se actualicen todas las vistas.

## Evidencia de uso de IA

El desarrollo se realizó con apoyo de IA (Grok & Cursor). La evidencia completa está en la carpeta:

`.plan/`

Contiene:

- `plan-general.md`
- `plan-backend.md`
- `plan-frontend.md`
- `prompts-backend.md`
- `prompts-frontend.md`
- `data-model.md`
- `api-spec.md`

## Plus opcional Docker

Completado al 100%.

- Backend y Frontend dockerizados
- PostgreSQL en contenedor
- Orquestación completa con `docker compose up --build`
