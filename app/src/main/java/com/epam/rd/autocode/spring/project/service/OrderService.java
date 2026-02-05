package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface OrderService {

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    Page<OrderDTO> searchOrders(String clientEmail, String city, BigDecimal minPrice, BigDecimal maxPrice,
            LocalDateTime dateFrom, Pageable pageable);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE') or authentication.name == #clientEmail")
    Page<OrderDTO> getOrdersByClient(String clientEmail, Pageable pageable);

    @PreAuthorize("hasRole('ADMIN') or authentication.name == #employeeEmail")
    Page<OrderDTO> getOrdersByEmployee(String employeeEmail, Pageable pageable);

    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    OrderDTO addOrder(OrderDTO order);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    OrderDTO confirmOrder(Long id);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    OrderDTO cancelOrder(Long id);
}