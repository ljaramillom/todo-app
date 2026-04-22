# Especificación API REST (Backend)

Base: /api/tasks

GET /api/tasks?page=0&size=10&search=texto → Listado paginado + búsqueda
POST /api/tasks → Crear tarea
PUT /api/tasks/{id} → Editar tarea completa
PATCH /api/tasks/{id}/status → Cambiar solo estado
DELETE /api/tasks/{id} → Eliminar
PATCH /api/subtasks/{id}/toggle → Marcar/desmarcar ítem

(Se irá completando con los endpoints reales a medida que los generemos)