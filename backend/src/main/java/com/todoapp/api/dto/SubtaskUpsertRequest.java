package com.todoapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Subtarea en actualización completa (PUT). {@code id} nulo: nueva subtarea; con id: sustituye datos de la existente.
 */
public record SubtaskUpsertRequest(
        Long id,
        @NotBlank
        @Size(max = 2000)
        String description,
        Boolean completed
) {

    public SubtaskUpsertRequest {
        completed = Boolean.TRUE.equals(completed);
    }
}
