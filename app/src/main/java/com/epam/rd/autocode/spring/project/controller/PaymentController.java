package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.cart.CartItemDTO;
import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.payment.PaymentResponse;
import com.epam.rd.autocode.spring.project.service.impl.ShoppingCartServiceImpl;
import com.epam.rd.autocode.spring.project.service.impl.StripeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final ShoppingCartServiceImpl shoppingCartService;
    private final ObjectMapper objectMapper;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> checkout(@RequestBody CheckoutRequest deliveryRequest) {
        try {
            System.out.println(" Checkout initiated for user: "
                    + SecurityContextHolder.getContext().getAuthentication().getName());
            System.out.println(" Delivery Request: " + deliveryRequest);
            PaymentResponse response = stripeService.createPaymentIntent(deliveryRequest);
            System.out.println(" Stripe PaymentIntent Created: " + response.getClientSecret());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(" ERROR in /api/payment/checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String type = root.path("type").asText();

            if ("checkout.session.completed".equals(type)) {
                JsonNode sessionNode = root.path("data").path("object");

                String customerEmail = sessionNode.path("customer_details").path("email").asText();

                if (customerEmail == null || customerEmail.isEmpty()) {
                    customerEmail = sessionNode.path("customer_email").asText();
                }

                if (customerEmail == null || customerEmail.isEmpty()) {
                    customerEmail = sessionNode.path("metadata").path("customer_email").asText();
                }

                if (customerEmail == null || customerEmail.isEmpty()) {
                    System.out.println("⚠️ No email found in webhook.");
                    return ResponseEntity.ok("Received (No Email)");
                }

                CheckoutRequest checkoutRequest = new CheckoutRequest();
                BigDecimal usedBonuses = BigDecimal.ZERO;

                JsonNode metadata = sessionNode.path("metadata");
                if (!metadata.isMissingNode()) {
                    if (metadata.hasNonNull("deliveryCity"))
                        checkoutRequest.setDeliveryCity(metadata.path("deliveryCity").asText());
                    if (metadata.hasNonNull("deliveryCityRef"))
                        checkoutRequest.setDeliveryCityRef(metadata.path("deliveryCityRef").asText());
                    if (metadata.hasNonNull("deliveryBranch"))
                        checkoutRequest.setDeliveryBranch(metadata.path("deliveryBranch").asText());
                    if (metadata.hasNonNull("deliveryBranchRef"))
                        checkoutRequest.setDeliveryBranchRef(metadata.path("deliveryBranchRef").asText());

                    if (metadata.hasNonNull("usedBonuses")) {
                        String bonusesStr = metadata.path("usedBonuses").asText();
                        try {
                            usedBonuses = new BigDecimal(bonusesStr);
                        } catch (NumberFormatException e) {
                            System.err.println(" Webhook: Error parsing usedBonuses: " + bonusesStr);
                        }
                    }

                    if (metadata.hasNonNull("cart_items")) {
                        String itemsStr = metadata.path("cart_items").asText();
                        String[] itemsParts = itemsStr.split(",");
                        List<CartItemDTO> items = new ArrayList<>();
                        for (String part : itemsParts) {
                            String[] pair = part.split(":");
                            if (pair.length == 2) {
                                CartItemDTO item = new CartItemDTO();
                                item.setBookId(Long.parseLong(pair[0]));
                                item.setQuantity(Integer.parseInt(pair[1]));
                                items.add(item);
                            }
                        }
                        checkoutRequest.setItems(items);
                    }
                }

                manualAuthentication(customerEmail);

                try {
                    if (checkoutRequest.getItems() != null && !checkoutRequest.getItems().isEmpty()) {
                        shoppingCartService.checkout(checkoutRequest, checkoutRequest.getItems(), usedBonuses);
                    } else {
                        shoppingCartService.checkout(checkoutRequest, usedBonuses);
                    }
                    System.out.println(" ORDER SAVED SUCCESSFULLY!");
                } catch (Exception e) {
                    System.err.println(" Checkout Logic Failed: " + e.getMessage());
                    e.printStackTrace();
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }

        } catch (Exception e) {
            System.err.println(" Webhook JSON Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("JSON Error");
        }

        return ResponseEntity.ok("Received");
    }

    private void manualAuthentication(String email) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                email, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @GetMapping("/success")
    public ResponseEntity<String> paymentSuccess() {
        return ResponseEntity.ok("Payment successful! Your order is being processed.");
    }

    @GetMapping("/cancel")
    public ResponseEntity<String> paymentCancel() {
        return ResponseEntity.ok("Payment canceled.");
    }
}