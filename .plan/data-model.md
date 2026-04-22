# Modelo de Datos - Entidades JPA

## Task
id (Long)
title (String, obligatorio)
description (String)
executionDate (LocalDateTime, obligatorio)
status (TaskStatus enum)
subtasks (List<Subtask> - OneToMany con cascade ALL y orphanRemoval)

## Subtask
id (Long)
description (String)
completed (boolean)
task (ManyToOne)

Enum TaskStatus: PROGRAMADO, EN_EJECUCION, FINALIZADA, CANCELADA

Relación: Una tarea puede tener muchos ítems checkeables.