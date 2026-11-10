package com.ecommerce.service;

import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
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
    private final UserRepository userRepository;

    public CartResponse getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUser_Id(userId);
        List<CartItemDTO> dtos = items.stream().map(item -> {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            return toDTO(item, product);
        }).toList();

        BigDecimal total = dtos.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = dtos.stream().mapToInt(CartItemDTO::getQuantity).sum();

        return CartResponse.builder()
                .items(dtos)
                .totalItems(totalItems)
                .totalPrice(total)
                .build();
    }

    @Transactional
    public CartItemDTO addToCart(Long userId, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Not enough stock. Available: " + product.getStock());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // If the product is already in the cart, increase quantity (enforced by UNIQUE constraint)
        CartItem cartItem = cartItemRepository
                .findByUser_IdAndProductId(userId, request.getProductId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (newQty > product.getStock()) {
                        throw new BadRequestException("Not enough stock. Available: " + product.getStock());
                    }
                    existing.setQuantity(newQty);
                    return existing;
                })
                .orElse(CartItem.builder()
                        .user(user)
                        .productId(request.getProductId())
                        .quantity(request.getQuantity())
                        .build());

        CartItem saved = cartItemRepository.save(cartItem);
        log.info("Added to cart: productId={}, qty={}, userId={}", request.getProductId(), request.getQuantity(), userId);
        return toDTO(saved, product);
    }

    @Transactional
    public CartItemDTO updateCartItem(Long userId, Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item does not belong to this user");
        }

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", item.getProductId()));

        if (quantity > product.getStock()) {
            throw new BadRequestException("Not enough stock. Available: " + product.getStock());
        }

        item.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(item);
        return toDTO(saved, product);
    }

    @Transactional
    public void removeFromCart(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", itemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item does not belong to this user");
        }

        cartItemRepository.delete(item);
        log.info("Removed cart item id={}", itemId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUser_Id(userId);
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
