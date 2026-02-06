package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.payment.PaymentResponse;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.epam.rd.autocode.spring.project.service.impl.ShoppingCartServiceImpl;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.epam.rd.autocode.spring.project.service.impl.StripeService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StripeService stripeService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private ShoppingCartServiceImpl shoppingCartService;

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
    @WithMockUser(username = "test@test.com", roles = "CUSTOMER")
    void checkout_ShouldReturnPaymentResponse() throws Exception {
        CheckoutRequest request = new CheckoutRequest();
        PaymentResponse response = new PaymentResponse("http://stripe.url", "pi_test_secret");

        when(stripeService.createPaymentIntent(any(CheckoutRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/payment/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSecret").value("pi_test_secret"));
    }

    @Test
    void handleStripeWebhook_ShouldReturnOk() throws Exception {
        String payload = "{\"type\": \"checkout.session.completed\", \"data\": {\"object\": {\"customer_email\": \"test@test.com\"}}}";

        mockMvc.perform(post("/api/payment/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }
}
