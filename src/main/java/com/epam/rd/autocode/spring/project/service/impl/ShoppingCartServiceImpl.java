package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.ShoppingCartDTO;
import com.epam.rd.autocode.spring.project.mapper.ShoppingCartMapper;
import com.epam.rd.autocode.spring.project.model.*;
import com.epam.rd.autocode.spring.project.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShoppingCartServiceImpl {

    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final ClientRepository clientRepository;
    private final OrderRepository orderRepository;
    private final ShoppingCartMapper cartMapper;

    @Transactional
    public ShoppingCartDTO getMyCart() {
        ShoppingCart cart = getOrCreateCart();
        return cartMapper.toDto(cart);
    }

    @Transactional
    public ShoppingCartDTO addToCart(Long bookId, Integer quantity) {
        ShoppingCart cart = getOrCreateCart();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getQuantity() < quantity) {
            throw new RuntimeException("Not enough books in stock!");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getBook().getId().equals(bookId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            if (book.getQuantity() < item.getQuantity() + quantity) {
                throw new RuntimeException("Not enough books in stock for update!");
            }
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem(cart, book, quantity);
            cart.getItems().add(newItem);
        }

        return cartMapper.toDto(cartRepository.save(cart));
    }

    @Transactional
    public ShoppingCartDTO removeOneOrDelete(Long cartItemId) {
        ShoppingCart cart = getOrCreateCart();
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getShoppingCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (item.getQuantity() > 1) {
            item.setQuantity(item.getQuantity() - 1);
        } else {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        }

        return cartMapper.toDto(cartRepository.save(cart));
    }

    @Transactional
    public ShoppingCartDTO removeItem(Long cartItemId) {
        ShoppingCart cart = getOrCreateCart();
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return cartMapper.toDto(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart() {
        ShoppingCart cart = getOrCreateCart();
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public void checkout() {
        ShoppingCart cart = getOrCreateCart();
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty!");
        }

        Order order = new Order();
        order.setClient(cart.getClient());
        order.setOrderDate(LocalDateTime.now());
        order.setBookItems(new ArrayList<>());

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Book book = cartItem.getBook();

            if (book.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for: " + book.getName());
            }

            // Списання зі складу
            book.setQuantity(book.getQuantity() - cartItem.getQuantity());
            bookRepository.save(book);

            BookItem bookItem = new BookItem();
            bookItem.setBook(book);
            bookItem.setQuantity(cartItem.getQuantity());
            bookItem.setOrder(order);

            order.getBookItems().add(bookItem);

            BigDecimal itemTotal = book.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            calculatedTotal = calculatedTotal.add(itemTotal);
        }

        order.setPrice(calculatedTotal);
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private ShoppingCart getOrCreateCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return cartRepository.findByClient_Email(email)
                .orElseGet(() -> {
                    Client client = clientRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Client not found"));
                    ShoppingCart cart = new ShoppingCart();
                    cart.setClient(client);
                    return cartRepository.save(cart);
                });
    }
}