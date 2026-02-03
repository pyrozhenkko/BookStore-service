package com.epam.rd.autocode.spring.project.dto.favorite;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class FavoriteDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FavoriteRequest {
        private Long bookId;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FavoriteItemDTO {
        private Long id;
        private BookDTO book;
        private String note;
        private LocalDateTime addedAt;
    }
}