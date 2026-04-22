package com.todoapp.service;

import com.todoapp.api.dto.CreateTaskRequest;
import com.todoapp.api.dto.TaskListQueryParams;
import com.todoapp.api.dto.TaskResponse;
import com.todoapp.api.dto.UpdateTaskRequest;
import com.todoapp.domain.model.Task;
import com.todoapp.domain.model.TaskStatus;
import com.todoapp.mapper.TaskMapper;
import com.todoapp.repository.TaskRepository;
import com.todoapp.repository.TaskSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(TaskListQueryParams params) {
        Specification<Task> spec = TaskSpecification.toSpecification(params);
        Pageable pageable = TaskSpecification.toPageable(params);
        return taskRepository.findAll(spec, pageable).map(taskMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarea no encontrada: " + id));
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        Task saved = taskRepository.save(taskMapper.toEntity(request));
        return taskMapper.toResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarea no encontrada: " + id));
        taskMapper.updateEntityFromRequest(request, task);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Tarea no encontrada: " + id);
        }
        taskRepository.deleteById(id);
    }

    /**
     * Cambia el estado con reglas de transición. Mismo estado = idempotente (solo refresca persistencia).
     */
    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarea no encontrada: " + id));
        TaskStatus current = task.getStatus();
        if (current != newStatus) {
            assertAllowedTransition(current, newStatus);
            task.setStatus(newStatus);
        }
        return taskMapper.toResponse(taskRepository.save(task));
    }

    /**
     * Alertas en tiempo real: tareas en {@link TaskStatus#PROGRAMADO} cuya {@code executionDate} ya pasó.
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> findOverdueScheduledTasks() {
        TaskListQueryParams params = new TaskListQueryParams(0, 10, null, null, true, null);
        List<Task> tasks = taskRepository.findAll(
                TaskSpecification.toSpecification(params),
                TaskSpecification.defaultSort()
        );
        return taskMapper.toResponseList(tasks);
    }

    /**
     * Tareas pendientes de ejecución: {@link TaskStatus#PROGRAMADO} o {@link TaskStatus#EN_EJECUCION}.
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> findPendingTasks() {
        TaskListQueryParams params = new TaskListQueryParams(0, 10, null, null, null, true);
        List<Task> tasks = taskRepository.findAll(
                TaskSpecification.toSpecification(params),
                TaskSpecification.defaultSort()
        );
        return taskMapper.toResponseList(tasks);
    }

    private static void assertAllowedTransition(TaskStatus from, TaskStatus to) {
        switch (from) {
            case PROGRAMADO -> {
                if (to != TaskStatus.EN_EJECUCION && to != TaskStatus.CANCELADA) {
                    throw new IllegalStateException(
                            "Desde PROGRAMADO solo se puede pasar a EN_EJECUCION o CANCELADA (solicitado: " + to + ")");
                }
            }
            case EN_EJECUCION -> {
                if (to != TaskStatus.FINALIZADA && to != TaskStatus.CANCELADA) {
                    throw new IllegalStateException(
                            "Desde EN_EJECUCION solo se puede pasar a FINALIZADA o CANCELADA (solicitado: " + to + ")");
                }
            }
            case FINALIZADA, CANCELADA -> throw new IllegalStateException(
                    "Estado terminal (" + from + "); no se permiten más cambios");
        }
    }
}
