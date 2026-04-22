package com.todoapp.api.dto;

/**
 * Representación de una subtarea en respuestas API.
 */
public record SubtaskResponse(
        Long id,
        String description,
        boolean completed
) {
}
