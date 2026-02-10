package com.epam.rd.autocode.spring.project.dto.cart;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDTO {
    private Long id;
    private Long bookId;
    private String bookName;
    private String isbn;
    private BigDecimal price;
    private Integer quantity;
    private String author;
    private String imageUrl; // Посилання на фото (перше зі списку)
}