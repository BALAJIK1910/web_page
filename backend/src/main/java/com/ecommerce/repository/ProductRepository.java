package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategory(String category, Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE (cast(:category as string) IS NULL OR p.category = cast(:category as string))
              AND (cast(:search as string) IS NULL
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))
                   OR LOWER(p.description) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))
            """)
    Page<Product> findByCategoryAndSearch(
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findAllCategories();
}