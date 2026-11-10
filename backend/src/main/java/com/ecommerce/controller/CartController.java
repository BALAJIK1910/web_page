package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.dto.UpdateCartItemRequest;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /** GET /api/cart */
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(user.getId())));
    }

    /** POST /api/cart */
    @PostMapping
    public ResponseEntity<ApiResponse<CartItemDTO>> addToCart(
            @Valid @RequestBody CartItemRequest request,
            @AuthenticationPrincipal User user) {
        CartItemDTO item = cartService.addToCart(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", item));
    }

    /** PUT /api/cart/{itemId} */
    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartItemDTO>> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal User user) {
        CartItemDTO item = cartService.updateCartItem(user.getId(), itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.ok("Cart item updated", item));
    }

    /** DELETE /api/cart/{itemId} */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @PathVariable Long itemId,
            @AuthenticationPrincipal User user) {
        cartService.removeFromCart(user.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", null));
    }
}
