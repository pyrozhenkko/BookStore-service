package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.payment.PaymentResponse;
import com.epam.rd.autocode.spring.project.model.CartItem;
import com.epam.rd.autocode.spring.project.model.ShoppingCart;
import com.epam.rd.autocode.spring.project.repo.ShoppingCartRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${client.url}")
    private String clientUrl;

    private final ShoppingCartRepository cartRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Transactional
    public PaymentResponse createPaymentSession(CheckoutRequest deliveryRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ShoppingCart cart = cartRepository.findByClient_Email(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Налаштування сесії (успіх/відміна)
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientUrl + "/api/payment/success")
                .setCancelUrl(clientUrl + "/api/payment/cancel")
                .setCustomerEmail(email);

        // --- ЗБЕРІГАЄМО ДАНІ НОВОЇ ПОШТИ В МЕТАДАНІ ---
        // Це дозволить отримати їх назад у Webhook після оплати
        if (deliveryRequest != null) {
            paramsBuilder.putMetadata("deliveryCity", deliveryRequest.getDeliveryCity());
            paramsBuilder.putMetadata("deliveryCityRef", deliveryRequest.getDeliveryCityRef());
            paramsBuilder.putMetadata("deliveryBranch", deliveryRequest.getDeliveryBranch());
            paramsBuilder.putMetadata("deliveryBranchRef", deliveryRequest.getDeliveryBranchRef());
        }

        for (CartItem item : cart.getItems()) {
            long priceInCents = item.getBook().getPrice().multiply(new BigDecimal(100)).longValue();

            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(Long.valueOf(item.getQuantity()))
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("uah")
                                            .setUnitAmount(priceInCents)
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.getBook().getName())
                                                            .build())
                                            .build())
                            .build());
        }

        try {
            Session session = Session.create(paramsBuilder.build());
            return new PaymentResponse(session.getUrl());
        } catch (Exception e) {
            throw new RuntimeException("Error creating Stripe session: " + e.getMessage());
        }
    }
}