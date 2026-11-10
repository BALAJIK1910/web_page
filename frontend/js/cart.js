/**
 * cart.js — Cart page (cart.html) logic.
 * Handles displaying cart items, updating quantities, removing items, and checkout.
 */

// ================================================================
// State
// ================================================================
let cartData = null;

// ================================================================
// Render helpers
// ================================================================

const CAT_ICONS = {
    'electronics': '💻', 'clothing': '👕', 'home': '🏠',
    'books': '📚', 'sports': '⚽', 'beauty': '💄',
    'toys': '🧸', 'food': '🍎', 'automotive': '🚗', 'garden': '🌱',
};
function catIcon(category) {
    if (!category) return '🛒';
    return CAT_ICONS[category.toLowerCase()] || '🛒';
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.itemId = item.id;

    const imgHTML = item.productImageUrl
        ? `<img class="cart-item-img" src="${escHtml(item.productImageUrl)}" alt="${escHtml(item.productName)}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy" />
           <div class="cart-item-placeholder" style="display:none">${catIcon(item.productCategory)}</div>`
        : `<div class="cart-item-placeholder">${catIcon(item.productCategory)}</div>`;

    div.innerHTML = `
        ${imgHTML}
        <div class="cart-item-info">
            <div class="cart-item-name">${escHtml(item.productName)}</div>
            <div class="cart-item-price">${formatPrice(item.productPrice)} each</div>
            <div class="cart-item-qty-row">
                <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="999"
                    data-id="${item.id}" style="width:3.5rem" />
                <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
                <button class="btn btn-danger btn-sm" data-action="remove" data-id="${item.id}">Remove</button>
            </div>
        </div>
        <div class="cart-subtotal">${formatPrice(item.subtotal)}</div>
    `;

    // Quantity controls
    const qtyInput = div.querySelector('.qty-input');

    div.querySelector('[data-action="minus"]').addEventListener('click', () => {
        const v = parseInt(qtyInput.value, 10);
        if (v > 1) updateItemQty(item.id, v - 1, qtyInput, div);
    });

    div.querySelector('[data-action="plus"]').addEventListener('click', () => {
        const v = parseInt(qtyInput.value, 10);
        updateItemQty(item.id, v + 1, qtyInput, div);
    });

    qtyInput.addEventListener('change', () => {
        const v = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        qtyInput.value = v;
        updateItemQty(item.id, v, qtyInput, div);
    });

    div.querySelector('[data-action="remove"]').addEventListener('click', () => {
        removeItem(item.id, div);
    });

    return div;
}

// ================================================================
// API actions
// ================================================================

async function updateItemQty(itemId, newQty, inputEl, rowEl) {
    inputEl.disabled = true;
    try {
        const updatedCart = await CartAPI.updateCartItem(itemId, newQty);
        cartData = updatedCart;
        renderSummary(updatedCart);
        await updateCartBadge();

        // Update subtotal display
        const updatedItem = (updatedCart.items || []).find(i => i.id === itemId);
        if (updatedItem) {
            const subtotalEl = rowEl.querySelector('.cart-subtotal');
            if (subtotalEl) subtotalEl.textContent = formatPrice(updatedItem.subtotal);
            inputEl.value = updatedItem.quantity;
        }
    } catch (err) {
        showToast(err.message || 'Could not update quantity', 'error');
        // Revert input
        const original = (cartData?.items || []).find(i => i.id === itemId);
        if (original) inputEl.value = original.quantity;
    } finally {
        inputEl.disabled = false;
    }
}

async function removeItem(itemId, rowEl) {
    rowEl.style.opacity = '0.5';
    rowEl.style.pointerEvents = 'none';
    try {
        const updatedCart = await CartAPI.removeFromCart(itemId);
        cartData = updatedCart;
        rowEl.remove();
        renderSummary(updatedCart);
        await updateCartBadge();
        showToast('Item removed', '');

        // Check if cart is now empty
        if (!updatedCart.items || updatedCart.items.length === 0) {
            showEmptyCart();
        }
    } catch (err) {
        showToast(err.message || 'Could not remove item', 'error');
        rowEl.style.opacity = '1';
        rowEl.style.pointerEvents = '';
    }
}

// ================================================================
// Summary rendering
// ================================================================

function renderSummary(cart) {
    const totalItems = cart.totalItems || 0;
    const subtotal = cart.totalPrice || 0;
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    const countEl = document.getElementById('summaryItemCount');
    const subtotalEl = document.getElementById('summarySubtotal');
    const shippingEl = document.getElementById('summaryShipping');
    const totalEl = document.getElementById('summaryTotal');

    if (countEl) countEl.textContent = totalItems;
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// ================================================================
// Page states
// ================================================================

function showEmptyCart() {
    document.getElementById('cartLayout') && document.getElementById('cartLayout').classList.add('hidden');
    document.getElementById('emptyCart') && document.getElementById('emptyCart').classList.remove('hidden');
}

function showCartLayout(cart) {
    const layout = document.getElementById('cartLayout');
    const itemsContainer = document.getElementById('cartItems');
    if (!layout || !itemsContainer) return;

    itemsContainer.innerHTML = '';
    (cart.items || []).forEach(item => {
        itemsContainer.appendChild(renderCartItem(item));
    });

    renderSummary(cart);
    layout.classList.remove('hidden');
}

// ================================================================
// Checkout
// ================================================================

async function handleCheckout(e) {
    e.preventDefault();
    const btn = document.getElementById('checkoutBtn');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = 'Placing order…';

    try {
        const order = await OrdersAPI.checkout();
        const user = getCurrentUser();
        const displayName = order?.customerName || user?.fullName || 'you';

        // Show success
        const form = document.getElementById('checkoutForm');
        if (form) form.classList.add('hidden');
        const successEl = document.getElementById('orderSuccess');
        const msgEl = document.getElementById('orderSuccessMsg');

        if (successEl) successEl.classList.remove('hidden');
        if (msgEl) {
            msgEl.textContent = order
                ? `Order #${order.id || ''} confirmed for ${displayName}! Total: ${formatPrice(order.totalAmount)}.`
                : `Order confirmed for ${displayName}!`;
        }

        // Clear cart display
        const itemsContainer = document.getElementById('cartItems');
        if (itemsContainer) itemsContainer.innerHTML = '';

        // Update badge
        const badge = document.getElementById('cartBadge');
        if (badge) badge.textContent = '0';

        showToast('Order placed successfully! 🎉', 'success');

    } catch (err) {
        showToast(err.message || 'Checkout failed. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Place Order 🎉';
    }
}

// ================================================================
// Load cart
// ================================================================

async function loadCart() {
    const loadingEl = document.getElementById('cartLoading');
    const errorEl = document.getElementById('cartError');
    const emptyEl = document.getElementById('emptyCart');

    // Reset states
    loadingEl && loadingEl.classList.remove('hidden');
    errorEl && errorEl.classList.add('hidden');
    emptyEl && emptyEl.classList.add('hidden');
    document.getElementById('cartLayout')?.classList.add('hidden');

    try {
        const cart = await CartAPI.getCart();
        cartData = cart;

        loadingEl && loadingEl.classList.add('hidden');

        if (!cart.items || cart.items.length === 0) {
            showEmptyCart();
            await updateCartBadge();
            return;
        }

        showCartLayout(cart);
        await updateCartBadge();

    } catch (err) {
        loadingEl && loadingEl.classList.add('hidden');
        errorEl && errorEl.classList.remove('hidden');
        console.error('Failed to load cart:', err);
    }
}

// ================================================================
// Init
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if not authenticated
    if (!requireAuth()) return;

    initHamburger();

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);

    const retryBtn = document.getElementById('retryCartBtn');
    if (retryBtn) retryBtn.addEventListener('click', loadCart);

    loadCart();
});
