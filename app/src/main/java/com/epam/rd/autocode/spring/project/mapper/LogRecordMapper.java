package com.epam.rd.autocode.spring.project.mapper;

import com.epam.rd.autocode.spring.project.dto.LogRecordDTO;
import com.epam.rd.autocode.spring.project.model.LogRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface LogRecordMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "category", target = "category")
    @Mapping(source = "level", target = "level")
    @Mapping(source = "message", target = "message")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "timestamp", target = "timestamp")
    LogRecordDTO toDto(LogRecord logRecord);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "category", target = "category")
    @Mapping(source = "level", target = "level")
    @Mapping(source = "message", target = "message")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "timestamp", target = "timestamp")
    LogRecord toEntity(LogRecordDTO logRecordDTO);
}