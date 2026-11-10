package com.ecommerce.dto;

import lombok.*;

/**
 * Checkout request body — customer name is now auto-populated from the
 * authenticated user's full_name.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderRequest {
    private String customerName;
}
