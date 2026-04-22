package com.todoapp.api.dto;

import com.todoapp.domain.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Cuerpo para {@code PATCH /api/tasks/{id}/status}.
 */
public record PatchTaskStatusRequest(
        @NotNull
        TaskStatus status
) {
}
