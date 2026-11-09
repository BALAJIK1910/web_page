-- ============================================================
-- schema.sql — Reference schema matching your Supabase tables
-- ============================================================
-- This file matches the exact schema in your Supabase project.
-- It is for reference only (Spring Boot has ddl-auto=none).
-- ============================================================

-- ---- 1. products ----
CREATE TABLE IF NOT EXISTS products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- int8
    name        VARCHAR        NOT NULL,
    description TEXT,
    price       NUMERIC        NOT NULL,
    image_url   TEXT,
    category    VARCHAR,
    stock       INTEGER        NOT NULL DEFAULT 0,              -- int4
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---- 2. cart_items ----
CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- int8
    session_id  VARCHAR        NOT NULL,
    product_id  BIGINT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INTEGER        NOT NULL CHECK (quantity > 0),   -- int4
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---- 3. orders ----
CREATE TABLE IF NOT EXISTS orders (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- int8
    session_id    VARCHAR      NOT NULL,
    customer_name VARCHAR,
    total_amount  NUMERIC      NOT NULL,
    status        VARCHAR      NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---- 4. order_items ----
CREATE TABLE IF NOT EXISTS order_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- int8
    order_id   BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT         NOT NULL REFERENCES products(id),
    quantity   INTEGER        NOT NULL CHECK (quantity > 0),    -- int4
    unit_price NUMERIC        NOT NULL
);
