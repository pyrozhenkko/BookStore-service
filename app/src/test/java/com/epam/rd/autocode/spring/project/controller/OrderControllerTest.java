package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.OrderDTO;
import com.epam.rd.autocode.spring.project.service.OrderService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.epam.rd.autocode.spring.project.service.impl.StripeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private StripeService stripeService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @Test
    void searchOrders_ShouldReturnPagedOrders() throws Exception {
        OrderDTO order = new OrderDTO();
        order.setId(1L);
        order.setClientEmail("test@test.com");
        Page<OrderDTO> page = new PageImpl<>(List.of(order), PageRequest.of(0, 10), 1);

        when(orderService.searchOrders(nullable(String.class), nullable(String.class), nullable(String.class),
                nullable(BigDecimal.class), nullable(BigDecimal.class),
                nullable(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/orders/search")
                .param("clientEmail", "test@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].clientEmail").value("test@test.com"));
    }

    @Test
    void createOrder_ShouldReturnCreated() throws Exception {
        OrderDTO order = new OrderDTO();
        order.setClientEmail("test@test.com");
        when(orderService.addOrder(any(OrderDTO.class))).thenReturn(order);

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(order)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clientEmail").value("test@test.com"));
    }

    @Test
    void confirmOrder_ShouldReturnOk() throws Exception {
        OrderDTO order = new OrderDTO();
        order.setId(1L);
        when(orderService.confirmOrder(1L)).thenReturn(order);

        mockMvc.perform(post("/api/orders/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void cancelOrder_ShouldReturnOk() throws Exception {
        OrderDTO order = new OrderDTO();
        order.setId(1L);
        when(orderService.cancelOrder(1L)).thenReturn(order);

        mockMvc.perform(post("/api/orders/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}
