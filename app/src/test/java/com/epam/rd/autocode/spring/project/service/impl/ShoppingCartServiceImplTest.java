package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.cart.ShoppingCartDTO;
import com.epam.rd.autocode.spring.project.mapper.ShoppingCartMapper;
import com.epam.rd.autocode.spring.project.model.*;
import com.epam.rd.autocode.spring.project.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShoppingCartServiceImplTest {

    @Mock
    private ShoppingCartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ShoppingCartMapper cartMapper;
    @Mock
    private EmailService emailService;

    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private ShoppingCartServiceImpl cartService;

    private Client client;
    private ShoppingCart cart;
    private Book book;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setEmail("user@example.com");
        client.setBalance(BigDecimal.valueOf(100));

        cart = new ShoppingCart();
        cart.setId(1L);
        cart.setClient(client);
        cart.setItems(new ArrayList<>());

        book = new Book();
        book.setId(1L);
        book.setName("Test Book");
        book.setPrice(BigDecimal.valueOf(100));
        book.setQuantity(10);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@example.com");
    }

    @Test
    void addToCart_Success_ShouldAddItem() {
        when(cartRepository.findByClient_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(cartRepository.save(any())).thenReturn(cart);

        cartService.addToCart(1L, 2);

        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().get(0).getQuantity());
        verify(cartRepository).save(cart);
    }

    @Test
    void checkout_Success_ShouldCreateOrderAndProcessBalance() {
        CartItem item = new CartItem(cart, book, 2);
        cart.getItems().add(item);

        when(cartRepository.findByClient_Email("user@example.com")).thenReturn(Optional.of(cart));

        CheckoutRequest request = new CheckoutRequest();
        request.setDeliveryCity("Kyiv");

        cartService.checkout(request, BigDecimal.valueOf(10));

        // itemsTotal = 100 * 2 = 200
        // finalPrice = 200 - 10 = 190
        // cashback = 190 * 0.05 = 9.5
        // newBalance = 100 - 10 + 9.5 = 99.5

        assertEquals(BigDecimal.valueOf(99.5).setScale(1), client.getBalance().setScale(1));
        assertEquals(8, book.getQuantity());
        assertTrue(cart.getItems().isEmpty());
        verify(orderRepository).save(any(Order.class));
        verify(emailService).sendOrderConfirmationEmail(anyString(), any(Order.class));
    }

    @Test
    void checkout_EmptyCart_ShouldThrowException() {
        when(cartRepository.findByClient_Email("user@example.com")).thenReturn(Optional.of(cart));

        assertThrows(RuntimeException.class, () -> cartService.checkout(new CheckoutRequest()));
    }
}
