package com.epam.rd.autocode.spring.project.dto.cart;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String deliveryCity;
    private String deliveryCityRef;
    private String deliveryBranch;
    private String deliveryBranchRef;
}