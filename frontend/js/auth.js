/**
 * auth.js — Authentication helpers for ShopEase.
 * Manages JWT token storage, navbar state, and route guards.
 */

const TOKEN_KEY = 'shopease_token';
const USER_KEY  = 'shopease_user';

/** Return the stored JWT or null */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/** Return the stored user object or null */
function getCurrentUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** Store auth data after login/register */
function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Clear auth and redirect to login */
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
}

/**
 * Guard: if not logged in, redirect to login.html.
 * Returns token if authenticated.
 */
function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

/**
 * Update the navbar to show the user's name + logout button when logged in,
 * or a Login link when not. Call on DOMContentLoaded on every page.
 */
function updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove any existing auth nav item to avoid duplicates
    const existing = navLinks.querySelector('#navAuthItem');
    if (existing) existing.remove();

    const user = getCurrentUser();
    const li = document.createElement('li');
    li.id = 'navAuthItem';

    if (user) {
        li.innerHTML = `
            <span class="nav-user">
                <span class="nav-user-name">👤 ${escHtmlNav(user.fullName || user.email)}</span>
                <button class="btn btn-sm btn-outline" onclick="logout()" style="margin-left:0.5rem">Logout</button>
            </span>`;
    } else {
        li.innerHTML = `<a href="login.html" class="nav-login-link">Login</a>`;
    }

    navLinks.appendChild(li);
}

/** Simple HTML escaping for user-generated content in navbar */
function escHtmlNav(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Auto-update navbar on every page load
document.addEventListener('DOMContentLoaded', updateNavbar);
