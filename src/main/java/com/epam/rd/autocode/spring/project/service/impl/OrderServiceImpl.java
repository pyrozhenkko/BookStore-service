package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.BookItemDTO;
import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import com.epam.rd.autocode.spring.project.mapper.OrderMapper;
import com.epam.rd.autocode.spring.project.model.*;
import com.epam.rd.autocode.spring.project.repo.*;
import com.epam.rd.autocode.spring.project.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final BookRepository bookRepository;
    private final OrderMapper orderMapper;

    @Override
    public List<OrderDTO> getOrdersByClient(String clientEmail) {
        return orderRepository.findAllByClient_Email(clientEmail).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByEmployee(String employeeEmail) {
        return orderRepository.findAllByEmployee_Email(employeeEmail).stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO addOrder(OrderDTO orderDTO) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());

        Client client = clientRepository.findByEmail(orderDTO.getClientEmail())
                .orElseThrow(() -> new RuntimeException("Client not found: " + orderDTO.getClientEmail()));
        order.setClient(client);

        if (orderDTO.getEmployeeEmail() != null) {
            Employee employee = employeeRepository.findByEmail(orderDTO.getEmployeeEmail())
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + orderDTO.getEmployeeEmail()));
            order.setEmployee(employee);
        }

        List<BookItem> bookItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (orderDTO.getBookItems() != null) {
            for (BookItemDTO itemDto : orderDTO.getBookItems()) {
                Book book = bookRepository.findByName(itemDto.getBookName())
                        .orElseThrow(() -> new RuntimeException("Book not found: " + itemDto.getBookName()));

                BookItem bookItem = new BookItem();
                bookItem.setBook(book);
                bookItem.setQuantity(itemDto.getQuantity());
                bookItem.setOrder(order);

                bookItems.add(bookItem);

                BigDecimal itemCost = book.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
                totalPrice = totalPrice.add(itemCost);
            }
        }

        order.setBookItems(bookItems);
        order.setPrice(totalPrice);

        return orderMapper.toDto(orderRepository.save(order));
    }
}