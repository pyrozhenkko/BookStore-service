package com.epam.rd.autocode.spring.project.controller;

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

    // POST /api/cart/add?bookId=5&quantity=1
    @PostMapping("/add")
    public ResponseEntity<ShoppingCartDTO> addToCart(@RequestParam Long bookId,
                                                     @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(bookId, quantity));
    }

    @PostMapping("/item/{itemId}/decrement")
    public ResponseEntity<ShoppingCartDTO> decrementItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeOneOrDelete(itemId));
    }

    // DELETE /api/cart/item/10
    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<ShoppingCartDTO> removeItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout() {
        cartService.checkout();
        return ResponseEntity.ok("Order placed successfully!");
    }
}