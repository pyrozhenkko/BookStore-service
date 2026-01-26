package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import com.epam.rd.autocode.spring.project.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Не забудьте про security!
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO orderDTO) {
        return new ResponseEntity<>(orderService.addOrder(orderDTO), HttpStatus.CREATED);
    }

    @GetMapping("/client/{email}")
    @PreAuthorize("hasRole('EMPLOYEE') or authentication.name == #email")
    public ResponseEntity<List<OrderDTO>> getOrdersByClient(@PathVariable String email) {
        return ResponseEntity.ok(orderService.getOrdersByClient(email));
    }

    @GetMapping("/employee/{email}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == #email")
    public ResponseEntity<List<OrderDTO>> getOrdersByEmployee(@PathVariable String email) {
        return ResponseEntity.ok(orderService.getOrdersByEmployee(email));
    }
}