/**
 * products.js — Products listing page (products.html) AND product detail page (product.html).
 * Detects which page is active by checking for key DOM elements.
 */

// ================================================================
// Shared helpers
// ================================================================

const CATEGORY_ICONS_P = {
    'electronics':   '💻',
    'clothing':      '👕',
    'home':          '🏠',
    'books':         '📚',
    'sports':        '⚽',
    'beauty':        '💄',
    'toys':          '🧸',
    'food':          '🍎',
    'automotive':    '🚗',
    'garden':        '🌱',
    'default':       '🛒',
};

function getCatIcon(category) {
    if (!category) return CATEGORY_ICONS_P['default'];
    return CATEGORY_ICONS_P[category.toLowerCase()] || CATEGORY_ICONS_P['default'];
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ================================================================
// Products Listing Page
// ================================================================

let currentPage = 0;
let currentCategory = '';
let currentSearch = '';
let totalPages = 0;

function buildProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => window.location.href = `product.html?id=${product.id}`;

    const imgHTML = product.imageUrl
        ? `<img class="product-card-img" src="${esc(product.imageUrl)}" alt="${esc(product.name)}" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
           <div class="product-card-img-placeholder" style="display:none">${getCatIcon(product.category)}</div>`
        : `<div class="product-card-img-placeholder">${getCatIcon(product.category)}</div>`;

    card.innerHTML = `
        ${imgHTML}
        <div class="product-card-body">
            <span class="product-card-category">${esc(product.category || '')}</span>
            <div class="product-card-name">${esc(product.name)}</div>
            <div class="product-card-price">${formatPrice(product.price)}</div>
            <div class="product-card-stock ${product.stock === 0 ? 'out-of-stock' : ''}">
                ${product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
            </div>
        </div>
        <div class="product-card-footer">
            <button class="btn btn-primary btn-sm" style="flex:1"
                onclick="event.stopPropagation(); addToCartFromListing(${product.id}, this)"
                ${product.stock === 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
            <button class="btn btn-outline btn-sm"
                onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'">
                Details
            </button>
        </div>
    `;
    return card;
}

async function addToCartFromListing(productId, btn) {
    btn.disabled = true;
    btn.textContent = 'Adding…';
    try {
        await CartAPI.addToCart(productId, 1);
        showToast('Added to cart! 🛒', 'success');
        await updateCartBadge();
    } catch (err) {
        showToast(err.message || 'Failed to add to cart', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add to Cart';
    }
}

async function loadProducts(page = 0) {
    const loadingGrid = document.getElementById('loadingGrid');
    const productsGrid = document.getElementById('productsGrid');
    const errorState = document.getElementById('errorState');
    const emptyState = document.getElementById('emptyState');
    const resultsInfo = document.getElementById('resultsInfo');
    const pagination = document.getElementById('pagination');

    if (!productsGrid) return;

    // Show loading state
    loadingGrid && loadingGrid.classList.remove('hidden');
    productsGrid.classList.add('hidden');
    errorState && errorState.classList.add('hidden');
    emptyState && emptyState.classList.add('hidden');
    if (resultsInfo) resultsInfo.textContent = '';
    if (pagination) pagination.innerHTML = '';

    try {
        const data = await ProductsAPI.getProducts({
            category: currentCategory,
            search: currentSearch,
            page,
            size: 12,
        });

        loadingGrid && loadingGrid.classList.add('hidden');

        const products = data.content || [];
        totalPages = data.totalPages || 0;
        currentPage = data.number || 0;
        const totalElements = data.totalElements || 0;

        if (resultsInfo) {
            resultsInfo.textContent = totalElements
                ? `Showing ${products.length} of ${totalElements} product${totalElements !== 1 ? 's' : ''}`
                : '';
        }

        if (products.length === 0) {
            emptyState && emptyState.classList.remove('hidden');
            return;
        }

        productsGrid.innerHTML = '';
        products.forEach(p => productsGrid.appendChild(buildProductCard(p)));
        productsGrid.classList.remove('hidden');

        // Pagination
        renderPagination(pagination, currentPage, totalPages);

    } catch (err) {
        loadingGrid && loadingGrid.classList.add('hidden');
        errorState && errorState.classList.remove('hidden');
        console.error('Failed to load products:', err);
    }
}

function renderPagination(container, page, total) {
    if (!container || total <= 1) return;
    container.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = page === 0;
    prevBtn.onclick = () => loadProducts(page - 1);
    container.appendChild(prevBtn);

    // Page number buttons (show up to 5 around current)
    const start = Math.max(0, page - 2);
    const end = Math.min(total - 1, page + 2);

    if (start > 0) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => loadProducts(0);
        container.appendChild(firstBtn);
        if (start > 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '…';
            ellipsis.style.padding = '0 .4rem';
            container.appendChild(ellipsis);
        }
    }

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn${i === page ? ' active' : ''}`;
        btn.textContent = i + 1;
        btn.onclick = () => loadProducts(i);
        container.appendChild(btn);
    }

    if (end < total - 1) {
        if (end < total - 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '…';
            ellipsis.style.padding = '0 .4rem';
            container.appendChild(ellipsis);
        }
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn';
        lastBtn.textContent = total;
        lastBtn.onclick = () => loadProducts(total - 1);
        container.appendChild(lastBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = page >= total - 1;
    nextBtn.onclick = () => loadProducts(page + 1);
    container.appendChild(nextBtn);
}

async function loadCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    try {
        const categories = await ProductsAPI.getCategories();
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-chip${currentCategory === cat ? ' active' : ''}`;
            btn.dataset.category = cat;
            btn.textContent = cat;
            btn.onclick = () => selectCategory(cat, btn);
            container.appendChild(btn);
        });
    } catch {
        // non-critical — user can still search
    }
}

function selectCategory(cat, clickedBtn) {
    currentCategory = clickedBtn.classList.contains('active') ? '' : cat;

    // Update active state
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    if (currentCategory) clickedBtn.classList.add('active');
    else {
        const allBtn = document.querySelector('.filter-chip[data-category=""]');
        if (allBtn) allBtn.classList.add('active');
    }

    currentPage = 0;
    loadProducts(0);
}

function initProductsPage() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return; // not on products page

    // Read query params
    const params = new URLSearchParams(window.location.search);
    currentCategory = params.get('category') || '';
    currentSearch = params.get('search') || '';

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const retryBtn = document.getElementById('retryBtn');

    if (searchInput && currentSearch) searchInput.value = currentSearch;

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput ? searchInput.value.trim() : '';
            currentPage = 0;
            loadProducts(0);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim();
                currentPage = 0;
                loadProducts(0);
            }
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', () => loadProducts(currentPage));
    }

    // Set active chip for pre-selected category
    if (currentCategory) {
        const allChip = document.querySelector('.filter-chip[data-category=""]');
        if (allChip) allChip.classList.remove('active');
    }

    loadCategoryFilters();
    loadProducts(0);
}

// ================================================================
// Product Detail Page
// ================================================================

async function initDetailPage() {
    const detailEl = document.getElementById('productDetail');
    if (!detailEl) return; // not on detail page

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const loadingEl = document.getElementById('loadingDetail');
    const errorEl = document.getElementById('errorState');

    if (!productId) {
        loadingEl && loadingEl.classList.add('hidden');
        errorEl && errorEl.classList.remove('hidden');
        return;
    }

    try {
        const product = await ProductsAPI.getProduct(productId);

        // Populate breadcrumb
        const breadcrumb = document.getElementById('breadcrumbName');
        if (breadcrumb) breadcrumb.textContent = product.name;

        // Populate detail
        document.getElementById('detailName').textContent = product.name;
        document.getElementById('detailCategory').textContent = product.category || '';
        document.getElementById('detailPrice').textContent = formatPrice(product.price);
        document.getElementById('detailDescription').textContent = product.description || 'No description available.';

        // Stock info
        const stockEl = document.getElementById('detailStock');
        if (stockEl) {
            if (product.stock === 0) {
                stockEl.textContent = 'Out of stock';
                stockEl.className = 'stock-info none';
            } else if (product.stock <= 5) {
                stockEl.textContent = `Only ${product.stock} left in stock!`;
                stockEl.className = 'stock-info low';
            } else {
                stockEl.textContent = `${product.stock} in stock`;
                stockEl.className = 'stock-info';
            }
        }

        // Image
        const imgEl = document.getElementById('detailImage');
        if (imgEl) {
            if (product.imageUrl) {
                imgEl.src = product.imageUrl;
                imgEl.alt = product.name;
                imgEl.onerror = () => {
                    imgEl.style.display = 'none';
                    const wrap = imgEl.parentElement;
                    if (wrap) {
                        const ph = document.createElement('div');
                        ph.style.cssText = 'font-size:5rem;width:100%;height:100%;display:flex;align-items:center;justify-content:center;';
                        ph.textContent = getCatIcon(product.category);
                        wrap.appendChild(ph);
                    }
                };
            } else {
                imgEl.style.display = 'none';
                const wrap = imgEl.parentElement;
                if (wrap) {
                    const ph = document.createElement('div');
                    ph.style.cssText = 'font-size:5rem;width:100%;height:100%;display:flex;align-items:center;justify-content:center;';
                    ph.textContent = getCatIcon(product.category);
                    wrap.appendChild(ph);
                }
            }
        }

        // Quantity controls
        const qtyInput = document.getElementById('quantityInput');
        document.getElementById('qtyMinus').addEventListener('click', () => {
            const v = parseInt(qtyInput.value, 10);
            if (v > 1) qtyInput.value = v - 1;
        });
        document.getElementById('qtyPlus').addEventListener('click', () => {
            const v = parseInt(qtyInput.value, 10);
            if (v < product.stock) qtyInput.value = v + 1;
        });

        // Add to cart
        const addBtn = document.getElementById('addToCartBtn');
        if (addBtn) {
            if (product.stock === 0) {
                addBtn.disabled = true;
                addBtn.textContent = 'Out of Stock';
            }
            addBtn.addEventListener('click', async () => {
                const qty = parseInt(qtyInput.value, 10) || 1;
                addBtn.disabled = true;
                addBtn.textContent = 'Adding…';
                try {
                    await CartAPI.addToCart(product.id, qty);
                    showToast(`Added ${qty} item(s) to cart! 🛒`, 'success');
                    await updateCartBadge();
                } catch (err) {
                    showToast(err.message || 'Failed to add to cart', 'error');
                } finally {
                    addBtn.disabled = product.stock === 0;
                    addBtn.textContent = 'Add to Cart 🛒';
                }
            });
        }

        // Show detail, hide skeleton
        loadingEl && loadingEl.classList.add('hidden');
        detailEl.classList.remove('hidden');

    } catch (err) {
        loadingEl && loadingEl.classList.add('hidden');
        errorEl && errorEl.classList.remove('hidden');
        console.error('Failed to load product:', err);
    }
}

// Helper re-used from main.js context (safe to redefine here)
function getCatIconLocal(category) {
    const map = {
        'electronics': '💻', 'clothing': '👕', 'home': '🏠',
        'books': '📚', 'sports': '⚽', 'beauty': '💄',
        'toys': '🧸', 'food': '🍎', 'automotive': '🚗', 'garden': '🌱',
    };
    if (!category) return '🛒';
    return map[category.toLowerCase()] || '🛒';
}

// ================================================================
// Init
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    initHamburger();
    updateCartBadge();

    // Determine page context
    if (document.getElementById('productsGrid') !== null) {
        initProductsPage();
    } else if (document.getElementById('productDetail') !== null) {
        initDetailPage();
    }
});
