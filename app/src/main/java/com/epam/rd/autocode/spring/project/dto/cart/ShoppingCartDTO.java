package com.epam.rd.autocode.spring.project.dto.cart;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ShoppingCartDTO {
    private Long id;
    private BigDecimal totalPrice;
    private List<CartItemDTO> items;
}
