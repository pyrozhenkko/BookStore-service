package com.epam.rd.autocode.spring.project.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ReviewDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingRequest {
        private Integer rating; // 1-5
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentRequest {
        private String comment;
        private Integer rating; // 1-5, може бути null
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentResponse {
        private Long id;
        private String username;
        private String comment;
        private LocalDateTime createdAt;

        private Integer userRating; // Яку оцінку поставив цей юзер (може бути null)
        private boolean isVerifiedPurchase; // Чи купив він цю книгу
    }
}