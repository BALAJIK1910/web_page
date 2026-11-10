package com.ecommerce.repository;

import com.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser_Id(Long userId);

    Optional<CartItem> findByUser_IdAndProductId(Long userId, Long productId);

    @Transactional
    @Modifying
    void deleteByUser_Id(Long userId);

    int countByUser_Id(Long userId);
}
