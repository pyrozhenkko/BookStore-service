package com.epam.rd.autocode.spring.project.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookItemDTO {
    private String bookName;
    private Integer quantity;
    private BigDecimal price;
}