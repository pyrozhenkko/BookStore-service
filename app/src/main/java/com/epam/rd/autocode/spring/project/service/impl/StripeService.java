package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.CartItemDTO;
import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.payment.PaymentResponse;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.ShoppingCart;
import com.epam.rd.autocode.spring.project.repo.BookRepository;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.ShoppingCartRepository;
import com.epam.rd.autocode.spring.project.exception.AuthException;
import com.epam.rd.autocode.spring.project.exception.InvalidOperationException;
import com.epam.rd.autocode.spring.project.exception.NotFoundException;
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
    private final ClientRepository clientRepository;
    private final BookRepository bookRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Transactional
    public PaymentResponse createPaymentIntent(CheckoutRequest deliveryRequest) {
        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            throw new AuthException("Stripe API Key is not configured!");
        }
        Stripe.apiKey = stripeApiKey.trim();

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new AuthException("No authentication found in security context");
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(" Creating Payment Intent for: " + email);

        BigDecimal cartTotal = BigDecimal.ZERO;

        if (deliveryRequest != null && deliveryRequest.getItems() != null && !deliveryRequest.getItems().isEmpty()) {
            for (CartItemDTO itemDTO : deliveryRequest.getItems()) {
                Book book = bookRepository.findById(itemDTO.getBookId())
                        .orElseThrow(() -> new NotFoundException("Book not found: " + itemDTO.getBookId()));
                cartTotal = cartTotal.add(book.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
            }
        } else {
            ShoppingCart cart = cartRepository.findByClient_Email(email)
                    .orElseThrow(() -> new NotFoundException("Cart not found for user: " + email));

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new InvalidOperationException("Cannot checkout with an empty cart");
            }
            cartTotal = cart.getTotalPrice();
        }

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Client not found for user: " + email));

        BigDecimal bonusDiscount = BigDecimal.ZERO;

        if (deliveryRequest != null && deliveryRequest.isUseBonuses()) {
            BigDecimal balance = client.getBalance() != null ? client.getBalance() : BigDecimal.ZERO;

            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal maxDiscount = cartTotal.subtract(BigDecimal.ONE);

                if (maxDiscount.compareTo(BigDecimal.ZERO) > 0) {
                    bonusDiscount = balance.min(maxDiscount);
                }
            }
        }

        BigDecimal finalAmount = cartTotal.subtract(bonusDiscount);
        long amountInCents = finalAmount.multiply(new BigDecimal(100)).longValue();

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientUrl + "/#/orders?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(clientUrl + "/#/checkout")
                .setCustomerEmail(email)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("uah")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Books Purchase")
                                                                .build())
                                                .build())
                                .build());

        // метадані
        if (deliveryRequest != null) {
            paramsBuilder.putMetadata("deliveryCity",
                    deliveryRequest.getDeliveryCity() != null ? deliveryRequest.getDeliveryCity() : "");
            paramsBuilder.putMetadata("deliveryCityRef",
                    deliveryRequest.getDeliveryCityRef() != null ? deliveryRequest.getDeliveryCityRef() : "");
            paramsBuilder.putMetadata("deliveryBranch",
                    deliveryRequest.getDeliveryBranch() != null ? deliveryRequest.getDeliveryBranch() : "");
            paramsBuilder.putMetadata("deliveryBranchRef",
                    deliveryRequest.getDeliveryBranchRef() != null ? deliveryRequest.getDeliveryBranchRef() : "");
            paramsBuilder.putMetadata("usedBonuses", bonusDiscount.toString());
            paramsBuilder.putMetadata("customer_email", email);

            // Pack items: id:qty,id:qty
            if (deliveryRequest.getItems() != null && !deliveryRequest.getItems().isEmpty()) {
                StringBuilder itemsBuilder = new StringBuilder();
                for (CartItemDTO item : deliveryRequest.getItems()) {
                    if (itemsBuilder.length() > 0)
                        itemsBuilder.append(",");
                    itemsBuilder.append(item.getBookId()).append(":").append(item.getQuantity());
                }
                paramsBuilder.putMetadata("cart_items", itemsBuilder.toString());
            }
        }

        try {
            Session session = Session.create(paramsBuilder.build());
            return PaymentResponse.builder()
                    .paymentUrl(session.getUrl())
                    .clientSecret(session.getId()) // use ID as secret for backup
                    .build();
        } catch (Exception e) {
            System.err.println(" Stripe Checkout Session Creation Failed: " + e.getMessage());
            e.printStackTrace();
            throw new InvalidOperationException("Error creating Stripe Checkout Session: " + e.getMessage());
        }
    }

}
