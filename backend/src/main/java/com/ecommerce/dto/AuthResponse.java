package com.ecommerce.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String fullName;
    private String email;
    private String role;
}
