package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.payment.PaymentResponse;
import com.epam.rd.autocode.spring.project.model.CartItem;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.ShoppingCart;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.ShoppingCartRepository;
import com.stripe.Stripe;
import com.stripe.model.Coupon;
import com.stripe.model.checkout.Session;
import com.stripe.param.CouponCreateParams;
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
    private final ClientRepository clientRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Transactional
    public PaymentResponse createPaymentSession(CheckoutRequest deliveryRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        ShoppingCart cart = cartRepository.findByClient_Email(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientUrl + "/api/payment/success")
                .setCancelUrl(clientUrl + "/api/payment/cancel")
                .setCustomerEmail(email);

        BigDecimal bonusDiscount = BigDecimal.ZERO;
        BigDecimal cartTotal = cart.getTotalPrice();

        if (deliveryRequest != null && deliveryRequest.isUseBonuses()) {
            BigDecimal balance = client.getBalance() != null ? client.getBalance() : BigDecimal.ZERO;

            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal maxDiscount = cartTotal.subtract(BigDecimal.ONE);

                if (maxDiscount.compareTo(BigDecimal.ZERO) > 0) {
                    bonusDiscount = balance.min(maxDiscount);

                    try {
                        long discountInCents = bonusDiscount.multiply(new BigDecimal(100)).longValue();
                        CouponCreateParams couponParams = CouponCreateParams.builder()
                                .setAmountOff(discountInCents)
                                .setCurrency("uah")
                                .setDuration(CouponCreateParams.Duration.ONCE)
                                .setName("Bonus Points Discount")
                                .build();
                        Coupon coupon = Coupon.create(couponParams);

                        paramsBuilder.addDiscount(
                                SessionCreateParams.Discount.builder()
                                        .setCoupon(coupon.getId())
                                        .build()
                        );
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to apply bonus discount: " + e.getMessage());
                    }
                }
            }
        }

        // метадані
        if (deliveryRequest != null) {
            paramsBuilder.putMetadata("deliveryCity", deliveryRequest.getDeliveryCity());
            paramsBuilder.putMetadata("deliveryCityRef", deliveryRequest.getDeliveryCityRef());
            paramsBuilder.putMetadata("deliveryBranch", deliveryRequest.getDeliveryBranch());
            paramsBuilder.putMetadata("deliveryBranchRef", deliveryRequest.getDeliveryBranchRef());
            paramsBuilder.putMetadata("usedBonuses", bonusDiscount.toString());
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