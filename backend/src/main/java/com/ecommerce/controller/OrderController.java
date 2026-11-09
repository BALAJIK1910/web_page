package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderRequest;
import com.ecommerce.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders  — Checkout: creates order from cart
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> checkout(
            @Valid @RequestBody OrderRequest request,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(true);
        String sessionId = session.getId();
        OrderDTO order = orderService.checkout(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", order));
    }
}
