package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderRequest;
import com.ecommerce.entity.User;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** POST /api/orders — Checkout: creates order from cart */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> checkout(
            @RequestBody(required = false) OrderRequest request,
            @AuthenticationPrincipal User user) {
        OrderDTO order = orderService.checkout(user.getId(), request != null ? request : new OrderRequest());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", order));
    }
}
