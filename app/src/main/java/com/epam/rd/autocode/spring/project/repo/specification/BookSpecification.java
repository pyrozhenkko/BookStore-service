package com.epam.rd.autocode.spring.project.repo.specification;

import com.epam.rd.autocode.spring.project.model.Book;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class BookSpecification {

    public static Specification<Book> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), likePattern),
                    cb.like(cb.lower(root.get("author")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern));
        };
    }

    public static Specification<Book> hasGenre(String genre) {
        return (root, query, cb) -> {
            if (genre == null || genre.trim().isEmpty()) {
                return null;
            }
            return cb.equal(cb.lower(root.get("genre")), genre.toLowerCase());
        };
    }

    public static Specification<Book> priceGreaterOrEqual(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null)
                return null;
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    public static Specification<Book> priceLessOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null)
                return null;
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    public static Specification<Book> hasStockStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty() || status.equalsIgnoreCase("all")) {
                return null;
            }
            if (status.equalsIgnoreCase("in-stock")) {
                return cb.greaterThan(root.get("quantity"), 0);
            }
            if (status.equalsIgnoreCase("low-stock")) {
                return cb.and(
                        cb.greaterThan(root.get("quantity"), 0),
                        cb.lessThan(root.get("quantity"), 10));
            }
            if (status.equalsIgnoreCase("out-of-stock")) {
                return cb.equal(root.get("quantity"), 0);
            }
            return null;
        };
    }
}