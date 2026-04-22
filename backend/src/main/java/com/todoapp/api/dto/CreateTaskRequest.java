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
 * Cuerpo para {@code POST /api/tasks}.
 */
public record CreateTaskRequest(
        @NotBlank
        @Size(max = 255)
        String title,
        @Size(max = 4000)
        String description,
        @NotNull
        LocalDateTime executionDate,
        TaskStatus status,
        @Valid
        List<@NotNull SubtaskCreateRequest> subtasks
) {

    public CreateTaskRequest {
        subtasks = subtasks == null ? new ArrayList<>() : new ArrayList<>(subtasks);
    }
}
