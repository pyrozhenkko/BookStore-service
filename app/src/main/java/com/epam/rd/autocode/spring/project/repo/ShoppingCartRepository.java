package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    Optional<ShoppingCart> findByClient_Email(String email);
}