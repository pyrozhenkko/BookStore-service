package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.BookItemDTO;
import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import com.epam.rd.autocode.spring.project.mapper.OrderMapper;
import com.epam.rd.autocode.spring.project.model.*;
import com.epam.rd.autocode.spring.project.repo.*;
import com.epam.rd.autocode.spring.project.repo.specification.OrderSpecification;
import com.epam.rd.autocode.spring.project.exception.InsufficientStockException;
import com.epam.rd.autocode.spring.project.exception.NotFoundException;
import com.epam.rd.autocode.spring.project.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final BookRepository bookRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> searchOrders(String clientEmail, String city, String status, BigDecimal minPrice,
            BigDecimal maxPrice,
            LocalDateTime dateFrom, Pageable pageable) {
        Specification<Order> spec = Specification.where(OrderSpecification.hasClientEmail(clientEmail))
                .and(OrderSpecification.hasDeliveryCity(city))
                .and(OrderSpecification.hasStatus(status))
                .and(OrderSpecification.priceGreaterOrEqual(minPrice))
                .and(OrderSpecification.priceLessOrEqual(maxPrice))
                .and(OrderSpecification.dateAfter(dateFrom));

        return orderRepository.findAll(spec, pageable).map(orderMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByClient(String clientEmail, Pageable pageable) {
        return orderRepository.findAllByClient_Email(clientEmail, pageable).map(orderMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByEmployee(String employeeEmail, Pageable pageable) {
        return orderRepository.findAllByEmployee_Email(employeeEmail, pageable).map(orderMapper::toDto);
    }

    @Override
    @Transactional
    public OrderDTO addOrder(OrderDTO orderDTO) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());

        Client client = clientRepository.findByEmail(orderDTO.getClientEmail())
                .orElseThrow(() -> new NotFoundException("Client not found: " + orderDTO.getClientEmail()));
        order.setClient(client);

        if (orderDTO.getEmployeeEmail() != null) {
            Employee employee = employeeRepository.findByEmail(orderDTO.getEmployeeEmail())
                    .orElseThrow(() -> new NotFoundException("Employee not found: " + orderDTO.getEmployeeEmail()));
            order.setEmployee(employee);
        }

        order.setDeliveryCity(orderDTO.getDeliveryCity());
        order.setDeliveryBranch(orderDTO.getDeliveryBranch());

        List<BookItem> bookItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (orderDTO.getBookItems() != null) {
            for (BookItemDTO itemDto : orderDTO.getBookItems()) {
                Book book = bookRepository.findByName(itemDto.getBookName())
                        .orElseThrow(() -> new NotFoundException("Book not found: " + itemDto.getBookName()));

                if (book.getQuantity() < itemDto.getQuantity()) {
                    throw new InsufficientStockException("Not enough stock for: " + book.getName());
                }
                book.setQuantity(book.getQuantity() - itemDto.getQuantity());
                bookRepository.save(book);

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

    @Override
    @Transactional
    public OrderDTO confirmOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Order not found"));
        order.setStatus("confirmed");
        return orderMapper.toDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Order not found"));
        order.setStatus("cancelled");
        return orderMapper.toDto(orderRepository.save(order));
    }
}