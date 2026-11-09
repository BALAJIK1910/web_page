package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/cart
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(HttpServletRequest request) {
        String sessionId = getOrCreateSessionId(request);
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(sessionId)));
    }

    /**
     * POST /api/cart
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CartItemDTO>> addToCart(
            @Valid @RequestBody CartItemRequest cartItemRequest,
            HttpServletRequest request) {
        String sessionId = getOrCreateSessionId(request);
        CartItemDTO item = cartService.addToCart(sessionId, cartItemRequest);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", item));
    }

    /**
     * PUT /api/cart/{itemId}
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartItemDTO>> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequest cartItemRequest,
            HttpServletRequest request) {
        String sessionId = getOrCreateSessionId(request);
        CartItemDTO item = cartService.updateCartItem(sessionId, itemId, cartItemRequest);
        return ResponseEntity.ok(ApiResponse.ok("Cart item updated", item));
    }

    /**
     * DELETE /api/cart/{itemId}
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @PathVariable Long itemId,
            HttpServletRequest request) {
        String sessionId = getOrCreateSessionId(request);
        cartService.removeFromCart(sessionId, itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", null));
    }

    private String getOrCreateSessionId(HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        return session.getId();
    }
}
