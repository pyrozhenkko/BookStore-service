package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookItem;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender emailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@bookstore.com");
        ReflectionTestUtils.setField(emailService, "clientUrl", "http://localhost:3000");
    }

    @Test
    void sendPasswordResetEmail_ShouldSendEmail() {
        emailService.sendPasswordResetEmail("user@example.com", "token123");

        verify(emailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendOrderConfirmationEmail_ShouldSendEmail() {
        Client client = new Client();
        client.setName("Test Client");

        Book book = new Book();
        book.setName("Test Book");
        book.setPrice(BigDecimal.TEN);

        BookItem item = new BookItem();
        item.setBook(book);
        item.setQuantity(1);

        Order order = new Order();
        order.setId(1L);
        order.setClient(client);
        order.setOrderDate(LocalDateTime.now());
        order.setPrice(BigDecimal.TEN);
        order.setBookItems(Collections.singletonList(item));

        emailService.sendOrderConfirmationEmail("user@example.com", order);

        verify(emailSender).send(any(SimpleMailMessage.class));
    }
}
