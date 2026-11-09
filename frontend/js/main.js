/**
 * main.js — Home page (index.html) logic.
 * Loads featured products and category chips.
 */

const CATEGORY_ICONS = {
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

function getCategoryIcon(category) {
    if (!category) return CATEGORY_ICONS['default'];
    return CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS['default'];
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => window.location.href = `product.html?id=${product.id}`;

    const imgHTML = product.imageUrl
        ? `<img class="product-card-img" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="product-card-img-placeholder" style="display:none">${getCategoryIcon(product.category)}</div>`
        : `<div class="product-card-img-placeholder">${getCategoryIcon(product.category)}</div>`;

    card.innerHTML = `
        ${imgHTML}
        <div class="product-card-body">
            <span class="product-card-category">${escapeHtml(product.category || '')}</span>
            <div class="product-card-name">${escapeHtml(product.name)}</div>
            <div class="product-card-price">${formatPrice(product.price)}</div>
            <div class="product-card-stock ${product.stock === 0 ? 'out-of-stock' : ''}">
                ${product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
            </div>
        </div>
        <div class="product-card-footer">
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="event.stopPropagation(); handleAddToCart(${product.id}, this)" ${product.stock === 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'">
                Details
            </button>
        </div>
    `;
    return card;
}

async function handleAddToCart(productId, btn) {
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

async function loadFeatured() {
    const grid = document.getElementById('featuredGrid');
    const errorEl = document.getElementById('featuredError');
    if (!grid) return;

    // Show skeletons
    grid.innerHTML = Array(4).fill('<div class="skeleton-card"></div>').join('');
    errorEl && errorEl.classList.add('hidden');

    try {
        const page = await ProductsAPI.getProducts({ page: 0, size: 8 });
        grid.innerHTML = '';
        const products = page.content || [];
        if (products.length === 0) {
            grid.innerHTML = '<p class="text-center" style="color:var(--text-muted);grid-column:1/-1">No products yet.</p>';
            return;
        }
        products.forEach(p => grid.appendChild(createProductCard(p)));
    } catch (err) {
        grid.innerHTML = '';
        errorEl && errorEl.classList.remove('hidden');
        console.error('Failed to load featured products:', err);
    }
}

async function loadCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    try {
        const categories = await ProductsAPI.getCategories();
        if (!categories || categories.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted)">No categories found.</p>';
            return;
        }
        categories.forEach(cat => {
            const a = document.createElement('a');
            a.className = 'category-card';
            a.href = `products.html?category=${encodeURIComponent(cat)}`;
            a.innerHTML = `
                <div class="cat-icon">${getCategoryIcon(cat)}</div>
                <h4>${escapeHtml(cat)}</h4>
            `;
            grid.appendChild(a);
        });
    } catch (err) {
        grid.innerHTML = '<p style="color:var(--text-muted)">Could not load categories.</p>';
        console.error('Failed to load categories:', err);
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    initHamburger();
    updateCartBadge();
    loadFeatured();
    loadCategories();
});
