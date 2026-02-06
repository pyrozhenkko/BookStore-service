package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.ShoppingCart;
import com.epam.rd.autocode.spring.project.repo.BookRepository;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.ShoppingCartRepository;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StripeServiceTest {

    @Mock
    private ShoppingCartRepository cartRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private StripeService stripeService;

    private MockedStatic<Session> mockedSession;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(stripeService, "stripeApiKey", "sk_test_123");
        ReflectionTestUtils.setField(stripeService, "clientUrl", "http://localhost:3000");

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("user@test.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        mockedSession = mockStatic(Session.class);
    }

    @AfterEach
    void tearDown() {
        mockedSession.close();
        SecurityContextHolder.clearContext();
    }

    @Test
    void createPaymentIntent_Success_ShouldReturnUrl() throws Exception {
        CheckoutRequest request = new CheckoutRequest();
        request.setUseBonuses(true);

        Client client = new Client();
        client.setBalance(BigDecimal.valueOf(10));

        ShoppingCart cart = mock(ShoppingCart.class);
        when(cart.getTotalPrice()).thenReturn(BigDecimal.valueOf(100));
        when(cart.getItems())
                .thenReturn(Collections.singletonList(mock(com.epam.rd.autocode.spring.project.model.CartItem.class)));

        Session session = mock(Session.class);
        when(session.getUrl()).thenReturn("http://stripe.url");
        when(session.getId()).thenReturn("sess_123");

        when(clientRepository.findByEmail(anyString())).thenReturn(Optional.of(client));
        when(cartRepository.findByClient_Email(anyString())).thenReturn(Optional.of(cart));
        mockedSession.when(() -> Session.create(any(SessionCreateParams.class))).thenReturn(session);

        var response = stripeService.createPaymentIntent(request);

        assertNotNull(response);
        assertEquals("http://stripe.url", response.getPaymentUrl());
        assertEquals("sess_123", response.getClientSecret());
    }

    @Test
    void createPaymentIntent_NoAuth_ShouldThrowException() {
        SecurityContextHolder.clearContext();
        assertThrows(RuntimeException.class, () -> stripeService.createPaymentIntent(new CheckoutRequest()));
    }
}
