package com.ecommerce.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String sessionId;
    private String customerName;
    private BigDecimal totalAmount;
    private String status;
    private List<OrderItemDTO> items;
    private OffsetDateTime createdAt;
}
