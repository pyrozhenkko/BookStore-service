package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.cart.ShoppingCartDTO;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.epam.rd.autocode.spring.project.service.impl.ShoppingCartServiceImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(ShoppingCartController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShoppingCartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShoppingCartServiceImpl shoppingCartService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @Test
    void getMyCart_ShouldReturnCart() throws Exception {
        ShoppingCartDTO cart = new ShoppingCartDTO();
        when(shoppingCartService.getMyCart()).thenReturn(cart);

        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk());
    }

    @Test
    void addToCart_ShouldReturnCart() throws Exception {
        ShoppingCartDTO cart = new ShoppingCartDTO();
        when(shoppingCartService.addToCart(anyLong(), anyInt())).thenReturn(cart);

        mockMvc.perform(post("/api/cart/add")
                .param("bookId", "1")
                .param("quantity", "2"))
                .andExpect(status().isOk());
    }

    @Test
    void checkout_ShouldReturnOk() throws Exception {
        CheckoutRequest request = new CheckoutRequest();
        request.setDeliveryCity("Kyiv");

        mockMvc.perform(post("/api/cart/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void clearCart_ShouldReturnOk() throws Exception {
        mockMvc.perform(delete("/api/cart"))
                .andExpect(status().isOk());
    }
}
