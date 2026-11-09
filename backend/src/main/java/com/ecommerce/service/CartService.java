package com.ecommerce.service;

import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartResponse getCart(String sessionId) {
        List<CartItem> items = cartItemRepository.findBySessionId(sessionId);
        List<CartItemDTO> dtos = items.stream().map(item -> {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            return toDTO(item, product);
        }).toList();

        BigDecimal total = dtos.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = dtos.stream()
                .mapToInt(CartItemDTO::getQuantity)
                .sum();

        return CartResponse.builder()
                .items(dtos)
                .totalItems(totalItems)
                .totalPrice(total)
                .build();
    }

    @Transactional
    public CartItemDTO addToCart(String sessionId, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Not enough stock. Available: " + product.getStock());
        }

        // If item already in cart, update quantity
        CartItem cartItem = cartItemRepository
                .findBySessionIdAndProductId(sessionId, request.getProductId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (newQty > product.getStock()) {
                        throw new BadRequestException("Not enough stock. Available: " + product.getStock());
                    }
                    existing.setQuantity(newQty);
                    return existing;
                })
                .orElse(CartItem.builder()
                        .sessionId(sessionId)
                        .productId(request.getProductId())
                        .quantity(request.getQuantity())
                        .build());

        CartItem saved = cartItemRepository.save(cartItem);
        log.info("Added to cart: productId={}, qty={}, session={}", request.getProductId(), request.getQuantity(), sessionId);
        return toDTO(saved, product);
    }

    @Transactional
    public CartItemDTO updateCartItem(String sessionId, Long itemId, CartItemRequest request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        if (!item.getSessionId().equals(sessionId)) {
            throw new BadRequestException("Cart item does not belong to this session");
        }

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", item.getProductId()));

        if (request.getQuantity() > product.getStock()) {
            throw new BadRequestException("Not enough stock. Available: " + product.getStock());
        }

        item.setQuantity(request.getQuantity());
        CartItem saved = cartItemRepository.save(item);
        return toDTO(saved, product);
    }

    @Transactional
    public void removeFromCart(String sessionId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        if (!item.getSessionId().equals(sessionId)) {
            throw new BadRequestException("Cart item does not belong to this session");
        }

        cartItemRepository.delete(item);
        log.info("Removed cart item id={}", itemId);
    }

    @Transactional
    public void clearCart(String sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
    }

    private CartItemDTO toDTO(CartItem item, Product product) {
        BigDecimal price = product != null ? product.getPrice() : BigDecimal.ZERO;
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(product != null ? product.getName() : "Unknown Product")
                .productImageUrl(product != null ? product.getImageUrl() : null)
                .productPrice(price)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
