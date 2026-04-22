package com.todoapp.api.dto;

import com.todoapp.domain.model.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Parámetros de consulta para {@code GET /api/tasks} (paginación, búsqueda y filtros de negocio).
 */
public record TaskListQueryParams(
        @Min(0)
        Integer page,
        @Min(1)
        @Max(100)
        Integer size,
        @Size(max = 255)
        String search,
        TaskStatus status,
        Boolean overdue,
        Boolean pendingOnly
) {

    public TaskListQueryParams {
        page = page == null ? 0 : page;
        size = size == null ? 10 : size;
    }

    public int pageIndex() {
        return page;
    }

    public int pageSize() {
        return size;
    }
}
