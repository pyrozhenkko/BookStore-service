package com.epam.rd.autocode.spring.project.mapper;

import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import com.epam.rd.autocode.spring.project.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "birthDate", target = "birthDate")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "position", target = "position")
    @Mapping(source = "hiredDate", target = "hiredDate")
    @Mapping(source = "admin", target = "admin")
    @Mapping(target = "active", expression = "java(!employee.isBlocked())")
    EmployeeDTO toDto(Employee employee);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "birthDate", target = "birthDate")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "position", target = "position")
    @Mapping(source = "hiredDate", target = "hiredDate")
    @Mapping(source = "admin", target = "admin")
    @Mapping(target = "blocked", expression = "java(!employeeDTO.isActive())")
    Employee toEntity(EmployeeDTO employeeDTO);
}