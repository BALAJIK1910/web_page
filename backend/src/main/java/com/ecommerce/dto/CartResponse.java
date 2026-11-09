package com.ecommerce.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private List<CartItemDTO> items;
    private int totalItems;
    private BigDecimal totalPrice;
}
