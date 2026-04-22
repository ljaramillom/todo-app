package com.todoapp.api.dto;

import com.todoapp.domain.model.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Representación completa de una tarea en respuestas API.
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDateTime executionDate,
        TaskStatus status,
        List<SubtaskResponse> subtasks,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
