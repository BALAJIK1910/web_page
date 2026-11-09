package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductRequest;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDTO> getProducts(String category, String search, Pageable pageable) {
        log.debug("Fetching products - category: {}, search: {}", category, search);
        String cat = StringUtils.hasText(category) ? category.trim() : null;
        String srch = StringUtils.hasText(search) ? search.trim() : null;

        Page<Product> page;
        if (cat != null && srch != null) {
            page = productRepository.findByCategoryAndSearch(cat, srch, pageable);
        } else if (cat != null) {
            page = productRepository.findByCategoryIgnoreCase(cat, pageable);
        } else if (srch != null) {
            page = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(srch, srch,
                    pageable);
        } else {
            page = productRepository.findAll(pageable);
        }

        return page.map(this::toDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .stock(request.getStock())
                .build();
        Product saved = productRepository.save(product);
        log.info("Created product id={}", saved.getId());
        return toDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());
        Product saved = productRepository.save(product);
        log.info("Updated product id={}", saved.getId());
        return toDTO(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
        log.info("Deleted product id={}", id);
    }

    public List<String> getCategories() {
        return productRepository.findAllCategories();
    }

    private ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .stock(p.getStock())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
