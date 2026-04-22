package com.todoapp.mapper;

import com.todoapp.api.dto.SubtaskCreateRequest;
import com.todoapp.api.dto.SubtaskResponse;
import com.todoapp.api.dto.SubtaskUpsertRequest;
import com.todoapp.domain.model.Subtask;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SubtaskMapper {

    @BeanMapping(ignoreUnmappedSourceProperties = "task")
    SubtaskResponse toResponse(Subtask entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    Subtask toEntity(SubtaskCreateRequest request);

    @Mapping(target = "task", ignore = true)
    Subtask toEntity(SubtaskUpsertRequest request);
}
