package com.todoapp.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "todo.cors")
public class CorsProperties {

    /**
     * Orígenes permitidos separados por comas; definir vía env {@code TODO_CORS_ALLOWED_ORIGINS} / {@code todo.cors.allowed-origins}.
     */
    private String allowedOrigins;

    public String getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public List<String> allowedOriginList() {
        if (allowedOrigins == null || allowedOrigins.isBlank()) {
            throw new IllegalStateException(
                    "todo.cors.allowed-origins está vacío; define la variable de entorno TODO_CORS_ALLOWED_ORIGINS (p. ej. en el .env de la raíz).");
        }
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
