package com.todoapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Subtarea enviada al crear una tarea (POST). Sin {@code id}: se crea nueva fila.
 */
public record SubtaskCreateRequest(
        @NotBlank
        @Size(max = 2000)
        String description,
        Boolean completed
) {

    public SubtaskCreateRequest {
        completed = Boolean.TRUE.equals(completed);
    }
}
