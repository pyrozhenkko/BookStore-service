package com.epam.rd.autocode.spring.project.dto.cart;

import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequest {
    private String deliveryCity;
    private String deliveryCityRef;
    private String deliveryBranch;
    private String deliveryBranchRef;
    private boolean useBonuses;
    private List<CartItemDTO> items;
}