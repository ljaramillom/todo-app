package com.todoapp.repository;

import com.todoapp.api.dto.TaskListQueryParams;
import com.todoapp.domain.model.Task;
import com.todoapp.domain.model.TaskStatus;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Especificaciones dinámicas para listar tareas según {@link TaskListQueryParams}
 * (alineado con {@code GET /api/tasks} en api-spec).
 * <p>
 * Para el orden por defecto, usar siempre {@link #toPageable(TaskListQueryParams)} junto con
 * {@link TaskRepository#findAll(Specification, Pageable)}.
 */
public final class TaskSpecification {

    private TaskSpecification() {
    }

    /**
     * Orden por defecto del dominio: {@code executionDate} ascendente.
     */
    public static Sort defaultSort() {
        return Sort.by(Sort.Direction.ASC, "executionDate");
    }

    /**
     * {@link Pageable} con orden estable por defecto: {@code executionDate} ascendente.
     */
    public static Pageable toPageable(TaskListQueryParams params) {
        return PageRequest.of(params.pageIndex(), params.pageSize(), defaultSort());
    }

    /**
     * Construye un {@link Specification} con filtros opcionales combinados con AND.
     */
    public static Specification<Task> toSpecification(TaskListQueryParams params) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(params.search())) {
                String term = "%" + escapeLike(params.search().trim()) + "%";
                var title = cb.like(cb.lower(root.get("title")), term, '\\');
                Expression<String> descriptionCoalesced = cb.coalesce(
                        root.get("description"),
                        cb.literal(""));
                var description = cb.like(cb.lower(descriptionCoalesced), term, '\\');
                predicates.add(cb.or(title, description));
            }

            if (params.status() != null) {
                predicates.add(cb.equal(root.get("status"), params.status()));
            }

            if (Boolean.TRUE.equals(params.overdue())) {
                LocalDateTime now = LocalDateTime.now();
                predicates.add(cb.equal(root.get("status"), TaskStatus.PROGRAMADO));
                predicates.add(cb.lessThanOrEqualTo(root.get("executionDate"), now));
            }

            if (Boolean.TRUE.equals(params.pendingOnly())) {
                predicates.add(root.get("status").in(TaskStatus.PROGRAMADO, TaskStatus.EN_EJECUCION));
            }

            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String escapeLike(String raw) {
        return raw
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_")
                .toLowerCase();
    }
}
