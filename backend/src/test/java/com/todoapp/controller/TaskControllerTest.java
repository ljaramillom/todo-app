package com.todoapp.controller;

import com.todoapp.api.dto.TaskListQueryParams;
import com.todoapp.api.dto.TaskResponse;
import com.todoapp.domain.model.TaskStatus;
import com.todoapp.service.TaskService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @Test
    void listTasksReturnsOk() throws Exception {
        var response = new TaskResponse(
                1L,
                "Comprar leche",
                "En el super",
                LocalDateTime.now().plusDays(1),
                TaskStatus.PROGRAMADO,
                List.of(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(taskService.getAllTasks(ArgumentMatchers.any(TaskListQueryParams.class)))
                .thenReturn(new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/tasks").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Comprar leche"));
    }

    @Test
    void createTaskReturnsCreated() throws Exception {
        var created = new TaskResponse(
                5L,
                "Nueva",
                null,
                LocalDateTime.parse("2026-05-01T10:00:00"),
                TaskStatus.PROGRAMADO,
                List.of(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(taskService.createTask(ArgumentMatchers.any())).thenReturn(created);

        String body = """
                {
                  "title": "Nueva",
                  "description": null,
                  "executionDate": "2026-05-01T10:00:00",
                  "status": "PROGRAMADO",
                  "subtasks": []
                }
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.title").value("Nueva"));
    }
}
