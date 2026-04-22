package com.todoapp.api.dto;

import com.todoapp.domain.model.TaskStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cuerpo para {@code PUT /api/tasks/{id}} (reemplazo completo de la tarea y su lista de subtareas).
 */
public record UpdateTaskRequest(
        @NotBlank
        @Size(max = 255)
        String title,
        @Size(max = 4000)
        String description,
        @NotNull
        LocalDateTime executionDate,
        @NotNull
        TaskStatus status,
        @Valid
        List<@NotNull SubtaskUpsertRequest> subtasks
) {

    public UpdateTaskRequest {
        subtasks = subtasks == null ? new ArrayList<>() : new ArrayList<>(subtasks);
    }
}
