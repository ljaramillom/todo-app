package com.todoapp.mapper;

import com.todoapp.api.dto.CreateTaskRequest;
import com.todoapp.api.dto.SubtaskUpsertRequest;
import com.todoapp.api.dto.TaskResponse;
import com.todoapp.api.dto.UpdateTaskRequest;
import com.todoapp.domain.model.Subtask;
import com.todoapp.domain.model.Task;
import com.todoapp.domain.model.TaskStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapeo Task ↔ DTOs. La clase es abstracta para combinar generación MapStruct con
 * reglas de negocio (subtareas en alta y upsert en PUT) usando {@link Task#addSubtask}
 * y {@link Task#removeSubtask}.
 */
@Mapper(
        componentModel = "spring",
        uses = SubtaskMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public abstract class TaskMapper {

    /**
     * MapStruct + Spring inyectan el mapper usado aquí (no duplicar con constructor:
     * el {@code TaskMapperImpl} generado no llamaba a {@code super(SubtaskMapper)}).
     */
    @Autowired
    protected SubtaskMapper subtaskMapper;

    public abstract TaskResponse toResponse(Task task);

    public List<TaskResponse> toResponseList(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return List.of();
        }
        return tasks.stream().map(this::toResponse).toList();
    }

    /**
     * {@link CreateTaskRequest} → nueva {@link Task} persistente (sin id) con subtareas enlazadas.
     */
    public Task toEntity(CreateTaskRequest request) {
        Task task = mapCreateShell(request);
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PROGRAMADO);
        }
        request.subtasks().forEach(sr -> task.addSubtask(subtaskMapper.toEntity(sr)));
        return task;
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    protected abstract Task mapCreateShell(CreateTaskRequest request);

    /**
     * Aplica un PUT completo: campos escalares + sincronización de subtareas (altas, updates, borrados huérfanos).
     */
    public void updateEntityFromRequest(UpdateTaskRequest request, @MappingTarget Task task) {
        mapUpdateIntoTask(request, task);
        applySubtasksUpsert(request, task);
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    protected abstract void mapUpdateIntoTask(UpdateTaskRequest request, @MappingTarget Task task);

    /**
     * Sincroniza la colección {@code task.subtasks} con {@code request.subtasks()} respetando orphanRemoval.
     */
    protected void applySubtasksUpsert(UpdateTaskRequest request, Task task) {
        Set<Long> requestedExistingIds = request.subtasks().stream()
                .map(SubtaskUpsertRequest::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        new ArrayList<>(task.getSubtasks()).stream()
                .filter(s -> s.getId() != null && !requestedExistingIds.contains(s.getId()))
                .forEach(task::removeSubtask);

        for (SubtaskUpsertRequest sur : request.subtasks()) {
            if (sur.id() == null) {
                task.addSubtask(subtaskMapper.toEntity(sur));
            } else {
                Subtask existing = findSubtaskById(task, sur.id());
                existing.setDescription(sur.description());
                existing.setCompleted(sur.completed());
            }
        }
    }

    private static Subtask findSubtaskById(Task task, Long id) {
        return task.getSubtasks().stream()
                .filter(s -> id.equals(s.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe subtarea con id " + id + " en la tarea " + task.getId()));
    }
}
