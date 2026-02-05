package com.epam.rd.autocode.spring.project.mapper;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.model.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ClientMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "balance", target = "balance")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "registeredDate", target = "registeredDate")
    @Mapping(source = "blocked", target = "blocked")
    @Mapping(target = "totalOrders", expression = "java(client.getOrders() != null ? client.getOrders().size() : 0)")
    ClientDTO toDto(Client client);

    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "orders", ignore = true)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "balance", target = "balance")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "registeredDate", target = "registeredDate")
    @Mapping(source = "blocked", target = "blocked")
    Client toEntity(ClientDTO clientDTO);
}