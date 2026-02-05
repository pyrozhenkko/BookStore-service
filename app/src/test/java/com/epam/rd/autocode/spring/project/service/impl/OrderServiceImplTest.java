package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.BookItemDTO;
import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import com.epam.rd.autocode.spring.project.mapper.OrderMapper;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.Order;
import com.epam.rd.autocode.spring.project.repo.BookRepository;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import com.epam.rd.autocode.spring.project.repo.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order order;
    private OrderDTO orderDTO;
    private Client client;
    private Book book;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setEmail("test@client.com");

        book = new Book();
        book.setName("Test Book");
        book.setPrice(BigDecimal.valueOf(100));
        book.setQuantity(10);

        order = new Order();
        order.setId(1L);

        orderDTO = new OrderDTO();
        orderDTO.setClientEmail("test@client.com");

        BookItemDTO itemDTO = new BookItemDTO();
        itemDTO.setBookName("Test Book");
        itemDTO.setQuantity(2);
        orderDTO.setBookItems(Collections.singletonList(itemDTO));
    }

    @Test
    void addOrder_Success_ShouldReduceStockAndSave() {
        when(clientRepository.findByEmail("test@client.com")).thenReturn(Optional.of(client));
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toDto(any(Order.class))).thenReturn(orderDTO);

        OrderDTO result = orderService.addOrder(orderDTO);

        assertNotNull(result);
        assertEquals(8, book.getQuantity()); // 10 - 2
        verify(bookRepository).save(book);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void addOrder_NotEnoughStock_ShouldThrowException() {
        book.setQuantity(1);
        when(clientRepository.findByEmail("test@client.com")).thenReturn(Optional.of(client));
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));

        assertThrows(RuntimeException.class, () -> orderService.addOrder(orderDTO));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void confirmOrder_ShouldSetStatusConfirmed() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderMapper.toDto(order)).thenReturn(orderDTO);

        orderService.confirmOrder(1L);

        assertEquals("confirmed", order.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void cancelOrder_ShouldSetStatusCancelled() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderMapper.toDto(order)).thenReturn(orderDTO);

        orderService.cancelOrder(1L);

        assertEquals("cancelled", order.getStatus());
        verify(orderRepository).save(order);
    }
}
