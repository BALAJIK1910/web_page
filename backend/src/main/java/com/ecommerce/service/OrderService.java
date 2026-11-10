package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.dto.OrderRequest;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDTO checkout(Long userId, OrderRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUser_Id(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty. Add items before checking out.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Order order = Order.builder()
                .user(user)
                .customerName(user.getFullName())
                .status("PENDING")
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", cartItem.getProductId()));

            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();

            order.getItems().add(orderItem);

            // Deduct stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after checkout
        cartItemRepository.deleteByUser_Id(userId);
        log.info("Order created id={}, customer={}, total={}", savedOrder.getId(), savedOrder.getCustomerName(), total);

        return toDTO(savedOrder);
    }

    private OrderDTO toDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return OrderItemDTO.builder()
                    .id(item.getId())
                    .productId(item.getProductId())
                    .productName(product != null ? product.getName() : "Product #" + item.getProductId())
                    .productImageUrl(product != null ? product.getImageUrl() : null)
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        return OrderDTO.builder()
                .id(order.getId())
                .customerName(order.getCustomerName())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(itemDTOs)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
