package com.epam.rd.autocode.spring.project.repo.specification;

import com.epam.rd.autocode.spring.project.model.LogRecord;
import org.springframework.data.jpa.domain.Specification;

public class LogSpecification {

    public static Specification<LogRecord> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("message")), likePattern),
                    cb.like(cb.lower(root.get("username")), likePattern)
            );
        };
    }

    public static Specification<LogRecord> hasCategory(String category) {
        return (root, query, cb) -> {
            if (category == null || category.trim().isEmpty()) {
                return null;
            }
            return cb.equal(root.get("category"), category);
        };
    }

    public static Specification<LogRecord> hasLevel(String level) {
        return (root, query, cb) -> {
            if (level == null || level.trim().isEmpty()) {
                return null;
            }
            return cb.equal(root.get("level"), level);
        };
    }
}