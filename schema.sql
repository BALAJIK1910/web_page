-- ============================================================
-- schema.sql — Reference schema matching your Supabase tables
-- ============================================================
-- This file matches the exact schema in your Supabase project.
-- It is for reference only (Spring Boot has ddl-auto=none).
-- ============================================================

-- ---- 1. users ----
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Trigger to trim users table to 20 newest accounts (managed in DB)
-- CREATE OR REPLACE FUNCTION trim_users_table() RETURNS TRIGGER AS $$
-- BEGIN
--     DELETE FROM users WHERE id NOT IN (
--         SELECT id FROM users ORDER BY created_at DESC, id DESC LIMIT 20
--     );
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;
-- CREATE TRIGGER trg_trim_users AFTER INSERT ON users
--     FOR EACH STATEMENT EXECUTE FUNCTION trim_users_table();

-- ---- 2. products ----
CREATE TABLE IF NOT EXISTS products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR      NOT NULL,
    description TEXT,
    price       NUMERIC      NOT NULL,
    image_url   TEXT,
    category    VARCHAR,
    stock       INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---- 3. cart_items ----
CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INTEGER      NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- ---- 4. orders ----
CREATE TABLE IF NOT EXISTS orders (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    total_amount  NUMERIC(10,2) NOT NULL,
    status        VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---- 5. order_items ----
CREATE TABLE IF NOT EXISTS order_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id   BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT         NOT NULL REFERENCES products(id),
    quantity   INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC        NOT NULL
);
