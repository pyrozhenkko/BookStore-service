package com.epam.rd.autocode.spring.project.mapper;

import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import com.epam.rd.autocode.spring.project.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EmployeeMapper {

    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "birthDate", target = "birthDate")
    @Mapping(source = "phone", target = "phone")
    EmployeeDTO toDto(Employee employee);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "birthDate", target = "birthDate")
    @Mapping(source = "phone", target = "phone")
    Employee toEntity(EmployeeDTO employeeDTO);
}