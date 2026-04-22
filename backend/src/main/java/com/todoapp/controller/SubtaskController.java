package com.todoapp.controller;

import com.todoapp.api.dto.SubtaskResponse;
import com.todoapp.service.SubtaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subtasks")
public class SubtaskController {

    private final SubtaskService subtaskService;

    public SubtaskController(SubtaskService subtaskService) {
        this.subtaskService = subtaskService;
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<SubtaskResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(subtaskService.toggleSubtask(id));
    }
}
