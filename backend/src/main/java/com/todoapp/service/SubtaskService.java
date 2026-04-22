package com.todoapp.service;

import com.todoapp.api.dto.SubtaskResponse;
import com.todoapp.domain.model.Subtask;
import com.todoapp.mapper.SubtaskMapper;
import com.todoapp.repository.SubtaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final SubtaskMapper subtaskMapper;

    public SubtaskService(SubtaskRepository subtaskRepository, SubtaskMapper subtaskMapper) {
        this.subtaskRepository = subtaskRepository;
        this.subtaskMapper = subtaskMapper;
    }

    @Transactional
    public SubtaskResponse toggleSubtask(Long id) {
        Subtask subtask = subtaskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subtarea no encontrada: " + id));
        subtask.setCompleted(!subtask.isCompleted());
        return subtaskMapper.toResponse(subtaskRepository.save(subtask));
    }
}
