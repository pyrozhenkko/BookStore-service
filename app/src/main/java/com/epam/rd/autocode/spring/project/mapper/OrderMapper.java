package com.epam.rd.autocode.spring.project.mapper;

import com.epam.rd.autocode.spring.project.dto.BookItemDTO;
import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import com.epam.rd.autocode.spring.project.model.BookItem;
import com.epam.rd.autocode.spring.project.model.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "client.email", target = "clientEmail")
    @Mapping(source = "client.name", target = "clientName")
    @Mapping(source = "client.phone", target = "clientPhone")
    @Mapping(source = "employee.email", target = "employeeEmail")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "bookItems", target = "bookItems")
    @Mapping(source = "deliveryCity", target = "deliveryCity")
    @Mapping(source = "deliveryBranch", target = "deliveryBranch")
    OrderDTO toDto(Order order);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "bookItems", ignore = true)
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "deliveryCity", target = "deliveryCity")
    @Mapping(source = "deliveryBranch", target = "deliveryBranch")
    Order toEntity(OrderDTO orderDTO);

    @Mapping(source = "book.name", target = "bookName")
    @Mapping(source = "quantity", target = "quantity")
    BookItemDTO toBookItemDto(BookItem bookItem);
}