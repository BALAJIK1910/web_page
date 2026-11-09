/**
 * api.js — Central API client for ShopEase.
 * All fetch calls go through here. Update API_BASE if your backend runs elsewhere.
 */

// Auto-detect local development vs deployed production environment
const IS_LOCAL = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.protocol === 'file:';

// TODO: Replace this with your actual deployed backend URL from Render (e.g. 'https://my-ecommerce-api.onrender.com/api')
const PRODUCTION_API_URL = 'https://YOUR-BACKEND-NAME.onrender.com/api';

const API_BASE = IS_LOCAL ? 'http://localhost:8080/api' : PRODUCTION_API_URL;

// ================================================================
// Generic helpers
// ================================================================

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const defaults = {
        credentials: 'include', // send session cookie
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    };
    const res = await fetch(url, { ...defaults, ...options });
    const json = await res.json();
    if (!res.ok) {
        const msg = json.message || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(msg);
    }
    return json.data;
}

// ================================================================
// Products API
// ================================================================

const ProductsAPI = {
    /**
     * Get paginated products list.
     * @param {object} params - { category, search, page, size }
     */
    async getProducts({ category = '', search = '', page = 0, size = 12 } = {}) {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        params.set('page', page);
        params.set('size', size);
        const qs = params.toString();
        return request(`/products${qs ? '?' + qs : ''}`);
    },

    /** Get single product by ID */
    async getProduct(id) {
        return request(`/products/${id}`);
    },

    /** Get all categories */
    async getCategories() {
        return request('/products/categories');
    },

    /** Admin: create product */
    async createProduct(data) {
        return request('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /** Admin: update product */
    async updateProduct(id, data) {
        return request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /** Admin: delete product */
    async deleteProduct(id) {
        return request(`/products/${id}`, { method: 'DELETE' });
    },
};

// ================================================================
// Cart API
// ================================================================

const CartAPI = {
    /** Get current session cart */
    async getCart() {
        return request('/cart');
    },

    /** Add item to cart */
    async addToCart(productId, quantity = 1) {
        return request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    /** Update quantity of a cart item */
    async updateCartItem(itemId, quantity) {
        return request(`/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ productId: 0, quantity }), // productId ignored on update
        });
    },

    /** Remove item from cart */
    async removeFromCart(itemId) {
        return request(`/cart/${itemId}`, { method: 'DELETE' });
    },
};

// ================================================================
// Orders API
// ================================================================

const OrdersAPI = {
    /** Place order (checkout) */
    async checkout({ customerName }) {
        return request('/orders', {
            method: 'POST',
            body: JSON.stringify({ customerName }),
        });
    },
};

// ================================================================
// Shared utilities
// ================================================================

/** Format a number as USD */
function formatPrice(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount ?? 0);
}

/** Show a toast notification */
let toastTimer = null;
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast${type ? ' ' + type : ''}`;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

/** Update the cart badge count in the navbar */
async function updateCartBadge() {
    try {
        const cart = await CartAPI.getCart();
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = cart.totalItems || 0;
        }
    } catch {
        // silently fail — badge just stays at 0
    }
}

/** Hamburger menu toggle */
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    }
}
