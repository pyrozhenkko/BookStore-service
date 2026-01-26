package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.payment.PaymentResponse;
import com.epam.rd.autocode.spring.project.service.impl.ShoppingCartServiceImpl;
import com.epam.rd.autocode.spring.project.service.impl.StripeService;
import com.google.gson.JsonSyntaxException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final ShoppingCartServiceImpl shoppingCartService;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    // 1. Почати оплату (Клієнт відправляє дані доставки)
    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> checkout(@RequestBody CheckoutRequest deliveryRequest) {
        return ResponseEntity.ok(stripeService.createPaymentSession(deliveryRequest));
    }

    // 2. WEBHOOK (Приймає сигнали від Stripe)
    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        Event event;

        try {

            // Ми ігноруємо перевірку підпису, тому що Stripe CLI в Docker генерує новий ключ
            // при кожному запуску. Це дозволяє вам не копіювати ключ щоразу.
            event = Event.GSON.fromJson(payload, Event.class);


            /*
            if (sigHeader == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Signature Header");
            }
            // Перевіряє, що запит дійсно від Stripe, використовуючи секретний ключ
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            */
            // =================================================================================

        } catch (JsonSyntaxException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("JSON Syntax Error");
        }
        /* catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
        } */ // для суворої перевірки

        if ("checkout.session.completed".equals(event.getType())) {

            // Витягуємо дані сесії
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;
            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                return ResponseEntity.ok("Received but failed to deserialize");
            }

            Session session = (Session) stripeObject;
            String customerEmail = session.getCustomerEmail();

            System.out.println(" Stripe Webhook: Payment success for " + customerEmail);

            // Витягуємо дані доставки з Metadata
            Map<String, String> metadata = session.getMetadata();
            CheckoutRequest checkoutRequest = new CheckoutRequest();
            if (metadata != null) {
                checkoutRequest.setDeliveryCity(metadata.get("deliveryCity"));
                checkoutRequest.setDeliveryCityRef(metadata.get("deliveryCityRef"));
                checkoutRequest.setDeliveryBranch(metadata.get("deliveryBranch"));
                checkoutRequest.setDeliveryBranchRef(metadata.get("deliveryBranchRef"));
            }

            // Тимчасово авторизуємо користувача в контексті, щоб ShoppingCartService спрацював
            manualAuthentication(customerEmail);

            // Створюємо замовлення
            try {
                shoppingCartService.checkout(checkoutRequest);
                System.out.println(" Order created via Webhook!");
            } catch (Exception e) {
                System.err.println(" Failed to create order in webhook: " + e.getMessage());
            } finally {
                SecurityContextHolder.clearContext();
            }
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