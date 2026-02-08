package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
import com.epam.rd.autocode.spring.project.dto.cart.ShoppingCartDTO;
import com.epam.rd.autocode.spring.project.service.impl.ShoppingCartServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class ShoppingCartController {

    private final ShoppingCartServiceImpl cartService;

    @GetMapping
    public ResponseEntity<ShoppingCartDTO> getMyCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    @PostMapping("/add")
    public ResponseEntity<ShoppingCartDTO> addToCart(@RequestParam("bookId") Long bookId,
            @RequestParam(name = "quantity", defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(bookId, quantity));
    }

    @PostMapping("/item/{itemId}/decrement")
    public ResponseEntity<ShoppingCartDTO> decrementItem(@PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(cartService.removeOneOrDelete(itemId));
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<ShoppingCartDTO> removeItem(@PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok().build();
    }

    // --- ОНОВЛЕНИЙ CHECKOUT ---
    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestBody CheckoutRequest request) {
        cartService.checkout(request);
        return ResponseEntity.ok("Order placed successfully with delivery to: " + request.getDeliveryCity());
    }
}