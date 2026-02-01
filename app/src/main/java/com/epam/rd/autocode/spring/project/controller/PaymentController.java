package com.epam.rd.autocode.spring.project.controller;

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
import java.util.Collections;

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
        return ResponseEntity.ok(stripeService.createPaymentSession(deliveryRequest));
    }

    // 2. WEBHOOK
    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String type = root.path("type").asText();


            if ("checkout.session.completed".equals(type)) {
                JsonNode sessionNode = root.path("data").path("object");

                String customerEmail = null;
                if (sessionNode.path("customer_details").hasNonNull("email")) {
                    customerEmail = sessionNode.path("customer_details").path("email").asText();
                } else if (sessionNode.hasNonNull("customer_email")) {
                    customerEmail = sessionNode.path("customer_email").asText();
                }

                if (customerEmail == null) {
                    System.out.println("⚠️ No email found in webhook.");
                    return ResponseEntity.ok("Received (No Email)");
                }


                CheckoutRequest checkoutRequest = new CheckoutRequest();
                BigDecimal usedBonuses = BigDecimal.ZERO;

                JsonNode metadata = sessionNode.path("metadata");
                if (!metadata.isMissingNode()) {
                    if (metadata.hasNonNull("deliveryCity")) checkoutRequest.setDeliveryCity(metadata.path("deliveryCity").asText());
                    if (metadata.hasNonNull("deliveryCityRef")) checkoutRequest.setDeliveryCityRef(metadata.path("deliveryCityRef").asText());
                    if (metadata.hasNonNull("deliveryBranch")) checkoutRequest.setDeliveryBranch(metadata.path("deliveryBranch").asText());
                    if (metadata.hasNonNull("deliveryBranchRef")) checkoutRequest.setDeliveryBranchRef(metadata.path("deliveryBranchRef").asText());

                    if (metadata.hasNonNull("usedBonuses")) {
                        String bonusesStr = metadata.path("usedBonuses").asText();
                        try {
                            usedBonuses = new BigDecimal(bonusesStr);
                        } catch (NumberFormatException e) {
                            System.err.println(" Webhook: Error parsing usedBonuses: " + bonusesStr);
                        }
                    }
                }

                manualAuthentication(customerEmail);

                try {
                    shoppingCartService.checkout(checkoutRequest, usedBonuses);
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

    private void manualAuthentication
    (String email) {
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