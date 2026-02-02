package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.cart.CheckoutRequest;
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

    private final EmailService emailService;

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
            throw new RuntimeException("Access denied to this item");
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

        if (!item.getShoppingCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied to this item");
        }

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
    public void checkout(CheckoutRequest request) {
        checkout(request, BigDecimal.ZERO);
    }

    @Transactional
    public void checkout(CheckoutRequest request, BigDecimal bonusDiscount) {
        ShoppingCart cart = getOrCreateCart();
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty!");
        }

        Client client = cart.getClient();
        Order order = new Order();
        order.setClient(client);
        order.setOrderDate(LocalDateTime.now());
        order.setBookItems(new ArrayList<>());

        if (request != null) {
            order.setDeliveryCity(request.getDeliveryCity());
            order.setDeliveryCityRef(request.getDeliveryCityRef());
            order.setDeliveryBranch(request.getDeliveryBranch());
            order.setDeliveryBranchRef(request.getDeliveryBranchRef());
        }

        BigDecimal itemsTotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Book book = cartItem.getBook();

            if (book.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for: " + book.getName());
            }

            book.setQuantity(book.getQuantity() - cartItem.getQuantity());
            bookRepository.save(book);

            BookItem bookItem = new BookItem();
            bookItem.setBook(book);
            bookItem.setQuantity(cartItem.getQuantity());
            bookItem.setOrder(order);

            order.getBookItems().add(bookItem);

            itemsTotal = itemsTotal.add(book.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        BigDecimal finalPrice = itemsTotal.subtract(bonusDiscount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }
        order.setPrice(finalPrice);

        if (bonusDiscount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentBalance = client.getBalance() != null ? client.getBalance() : BigDecimal.ZERO;
            BigDecimal newBalance = currentBalance.subtract(bonusDiscount).max(BigDecimal.ZERO);
            client.setBalance(newBalance);
            System.out.println("🔥 Bonuses used: " + bonusDiscount + ". New Balance: " + newBalance);
        }

        BigDecimal cashbackRate = new BigDecimal("0.05");
        BigDecimal cashbackEarned = finalPrice.multiply(cashbackRate);

        if (cashbackEarned.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentBalance = client.getBalance() != null ? client.getBalance() : BigDecimal.ZERO;
            client.setBalance(currentBalance.add(cashbackEarned));
            System.out.println("💰 Cashback earned: " + cashbackEarned);
        }

        clientRepository.save(client);
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        try {
            System.out.println("📧 Sending confirmation email to " + client.getEmail());
            emailService.sendOrderConfirmationEmail(client.getEmail(), order);
        } catch (Exception e) {
            System.err.println(" Failed to send order confirmation email: " + e.getMessage());
        }
    }

    private ShoppingCart getOrCreateCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return cartRepository.findByClient_Email(email)
                .orElseGet(() -> {
                    Client client = clientRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Client not found: " + email));
                    ShoppingCart cart = new ShoppingCart();
                    cart.setClient(client);
                    return cartRepository.save(cart);
                });
    }
}