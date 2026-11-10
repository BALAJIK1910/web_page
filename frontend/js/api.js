/**
 * api.js — Central API client for ShopEase.
 * All fetch calls go through here. JWT is sent as Authorization: Bearer <token>.
 */

// Auto-detect local development vs deployed production environment
const IS_LOCAL = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

// Your deployed backend URL from Render
const PRODUCTION_API_URL = 'https://ecommerce-backend-bu38.onrender.com/api';

// Ensures the API base always correctly points to '/api' without double or missing slashes
function getApiBaseUrl() {
    if (IS_LOCAL) return 'http://localhost:8080/api';
    let base = PRODUCTION_API_URL.trim().replace(/\/+$/, '');
    if (!base.endsWith('/api')) {
        base += '/api';
    }
    return base;
}

const API_BASE = getApiBaseUrl();

// ================================================================
// Generic helpers
// ================================================================

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const token = localStorage.getItem('shopease_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    let json = null;
    try {
        json = await res.json();
    } catch {
        // Fallback if response is not JSON (e.g., HTML error from gateway)
    }

    // If 401, the token is invalid/expired — redirect to login
    if (res.status === 401) {
        localStorage.removeItem('shopease_token');
        localStorage.removeItem('shopease_user');
        window.location.href = 'login.html';
        return;
    }

    if (!res.ok) {
        const msg = json?.message || `HTTP ${res.status}: ${res.statusText || 'Server error'}`;
        throw new Error(msg);
    }
    return json ? json.data : null;
}

// ================================================================
// Auth API
// ================================================================

const AuthAPI = {
    /** POST /api/auth/login */
    async login({ email, password }) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /** POST /api/auth/register */
    async register({ fullName, email, password }) {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password }),
        });
    },
};

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
    /** Get current user's cart */
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

    /** Update quantity of a cart item (sends only quantity) */
    async updateCartItem(itemId, quantity) {
        return request(`/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
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
    /** Place order (checkout) — customerName comes from JWT on the backend */
    async checkout() {
        return request('/orders', {
            method: 'POST',
            body: JSON.stringify({}),
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
    const token = localStorage.getItem('shopease_token');
    if (!token) {
        const badge = document.getElementById('cartBadge');
        if (badge) badge.textContent = '0';
        return;
    }
    try {
        const cart = await CartAPI.getCart();
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = cart ? (cart.totalItems || 0) : 0;
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
