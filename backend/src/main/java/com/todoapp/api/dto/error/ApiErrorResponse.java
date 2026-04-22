package com.todoapp.api.dto.error;

import java.time.Instant;
import java.util.List;

/**
 * Cuerpo JSON homogéneo para errores (Global Exception Handler).
 */
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {

    public static ApiErrorResponse of(
            int status,
            String error,
            String message,
            String path,
            List<String> details
    ) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, details);
    }
}
