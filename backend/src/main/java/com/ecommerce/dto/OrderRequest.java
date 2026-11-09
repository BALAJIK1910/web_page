package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    // Optional helper getter to handle either 'customerName' or 'name' from requests
    public String getCustomerName() {
        return customerName;
    }
}
