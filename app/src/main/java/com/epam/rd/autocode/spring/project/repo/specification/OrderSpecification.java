package com.epam.rd.autocode.spring.project.repo.specification;

import com.epam.rd.autocode.spring.project.model.Order;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderSpecification {

    public static Specification<Order> hasClientEmail(String email) {
        return (root, query, cb) -> {
            if (email == null || email.trim().isEmpty())
                return null;
            return cb.like(cb.lower(root.get("client").get("email")), "%" + email.toLowerCase() + "%");
        };
    }

    public static Specification<Order> hasDeliveryCity(String city) {
        return (root, query, cb) -> {
            if (city == null || city.trim().isEmpty())
                return null;
            return cb.like(cb.lower(root.get("deliveryCity")), "%" + city.toLowerCase() + "%");
        };
    }

    public static Specification<Order> priceGreaterOrEqual(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null ? null : cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<Order> priceLessOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null ? null : cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }

    public static Specification<Order> dateAfter(LocalDateTime date) {
        return (root, query, cb) -> date == null ? null : cb.greaterThanOrEqualTo(root.get("orderDate"), date);
    }

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("all")) {
                return null;
            }
            return cb.equal(cb.lower(root.get("status")), status.toLowerCase());
        };
    }
}