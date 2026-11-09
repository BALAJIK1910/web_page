# ShopEase — E-Commerce Application

A full-stack e-commerce web application built with **Java Spring Boot 3** (backend) and **vanilla JavaScript** (frontend), connected to a **Supabase PostgreSQL** database.

---

## Project Structure

```
web page/
├── backend/                        # Spring Boot API
│   ├── src/main/java/com/ecommerce/
│   │   ├── EcommerceApplication.java
│   │   ├── config/
│   │   │   └── CorsConfig.java
│   │   ├── controller/
│   │   │   ├── ProductController.java
│   │   │   ├── CartController.java
│   │   │   └── OrderController.java
│   │   ├── service/
│   │   │   ├── ProductService.java
│   │   │   ├── CartService.java
│   │   │   └── OrderService.java
│   │   ├── repository/
│   │   │   ├── ProductRepository.java
│   │   │   ├── CartItemRepository.java
│   │   │   └── OrderRepository.java
│   │   ├── entity/
│   │   │   ├── Product.java
│   │   │   ├── CartItem.java
│   │   │   ├── Order.java
│   │   │   └── OrderItem.java
│   │   ├── dto/
│   │   │   ├── ProductDTO.java / ProductRequest.java
│   │   │   ├── CartItemDTO.java / CartItemRequest.java / CartResponse.java
│   │   │   ├── OrderDTO.java / OrderItemDTO.java / OrderRequest.java
│   │   │   └── ApiResponse.java
│   │   └── exception/
│   │       ├── ResourceNotFoundException.java
│   │       ├── BadRequestException.java
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── index.html                  # Home / landing page
│   ├── products.html               # Product listing + search + filter
│   ├── product.html                # Product detail page
│   ├── cart.html                   # Cart + checkout
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js                  # All API calls + shared utilities
│       ├── main.js                 # Home page logic
│       ├── products.js             # Products & detail pages logic
│       └── cart.js                 # Cart page logic
├── schema.sql                      # Reference DB schema (do NOT auto-run)
└── README.md
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17 or later |
| Maven | 3.8+ |
| PostgreSQL (Supabase) | Already exists |
| A browser | Any modern browser |
| (Optional) VS Code + Live Server | For serving the frontend |

---

## 🗄️ Step 1 — Configure Supabase Credentials

> **Never commit credentials to version control.**

### Option A — Environment Variables (recommended)

Set these in your shell before running the app:

**Windows (PowerShell)**
```powershell
$env:SUPABASE_DB_URL      = "jdbc:postgresql://<host>:5432/<database>?sslmode=require"
$env:SUPABASE_DB_USER     = "postgres"
$env:SUPABASE_DB_PASSWORD = "your-supabase-password"
```

**Windows (CMD)**
```cmd
set SUPABASE_DB_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
set SUPABASE_DB_USER=postgres
set SUPABASE_DB_PASSWORD=your-supabase-password
```

**Linux / macOS**
```bash
export SUPABASE_DB_URL="jdbc:postgresql://<host>:5432/<database>?sslmode=require"
export SUPABASE_DB_USER="postgres"
export SUPABASE_DB_PASSWORD="your-supabase-password"
```

### Option B — `.env` file + a startup script

1. Copy `.env.example` → `.env` inside `backend/`
2. Fill in your values:
   ```env
   SUPABASE_DB_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=your-supabase-password
   ```
3. Source it before running Maven (Linux/macOS: `source .env && mvn spring-boot:run`)

> **Where to find the values in Supabase:**  
> Dashboard → Project → Settings → Database → Connection string (JDBC).  
> Use the "Direct connection" string (port 5432), not the connection pooler.

### application.properties reference

The placeholders in `backend/src/main/resources/application.properties` are:
```properties
# TODO: add Supabase credentials
spring.datasource.url=${SUPABASE_DB_URL:}
spring.datasource.username=${SUPABASE_DB_USER:}
spring.datasource.password=${SUPABASE_DB_PASSWORD:}
spring.jpa.hibernate.ddl-auto=none
```

---

## 🚀 Step 2 — Run the Backend

```bash
cd "c:\web page\backend"
mvn clean package -DskipTests
mvn spring-boot:run
```

The API will start at **http://localhost:8080**.

If credentials are missing, the app still starts and logs a clear warning:
```
WARNING: Supabase credentials are NOT configured.
```

### Verify the API is working
```bash
curl http://localhost:8080/api/products
curl http://localhost:8080/api/products/categories
```

---

## 🌐 Step 3 — Serve the Frontend

The frontend is plain HTML/CSS/JS — no build step needed.

### Option A — VS Code Live Server (easiest)
1. Open the `frontend/` folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**
4. It opens at `http://127.0.0.1:5500` (already in the CORS allow-list)

### Option B — Python HTTP Server
```bash
cd "c:\web page\frontend"
python -m http.server 5500
```
Then open **http://localhost:5500** in your browser.

### Option C — npx serve
```bash
cd "c:\web page\frontend"
npx serve . -p 5500
```

> **Frontend → Backend connection:**  
> The API base URL is set in `frontend/js/api.js`:
> ```js
> const API_BASE = 'http://localhost:8080/api';
> ```
> Change this if your backend runs on a different host/port.

---

## 🔗 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports `?category=&search=&page=&size=`) |
| GET | `/api/products/categories` | List all categories |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/cart` | Get current session cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/{itemId}` | Update cart item quantity |
| DELETE | `/api/cart/{itemId}` | Remove cart item |
| POST | `/api/orders` | Checkout (creates order from cart) |

All responses follow the shape:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## 🗃️ Database Tables

> See `schema.sql` for the full reference DDL.  
> Hibernate will **not** create or alter tables (`ddl-auto=none`).

| Table | Supabase Columns |
|-------|------------------|
| `products` | `id` (int8), `name` (varchar), `description` (text), `price` (numeric), `image_url` (text), `category` (varchar), `stock` (int4), `created_at` (timestamptz) |
| `cart_items` | `id` (int8), `session_id` (varchar), `product_id` (int8), `quantity` (int4), `created_at` (timestamptz) |
| `orders` | `id` (int8), `session_id` (varchar), `customer_name` (varchar), `total_amount` (numeric), `status` (varchar), `created_at` (timestamptz) |
| `order_items` | `id` (int8), `order_id` (int8), `product_id` (int8), `quantity` (int4), `unit_price` (numeric) |

### Mapping existing tables

If your Supabase tables have different names, edit the `@Table` and `@Column` annotations at the top of each entity file — all names are clearly commented with `// TODO: adjust column name if needed`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Maven |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL on Supabase |
| Utilities | Lombok, Bean Validation |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Inter |

---

## 🔒 Security Notes

- `.env` is listed in `.gitignore` — never commit it
- Credentials are read from environment variables only
- CORS is restricted to known frontend origins (update `CorsConfig.java` for production)
- Cart items are scoped by HTTP session ID
- Input validation is applied on all POST/PUT requests

---

## 📝 Customization Checklist

- [ ] Set `SUPABASE_DB_URL`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`
- [ ] Adjust `@Table`/`@Column` names in entity classes if your tables differ
- [ ] Update `API_BASE` in `frontend/js/api.js` for production deployment
- [ ] Update `allowedOrigins` in `CorsConfig.java` with your production frontend URL
- [ ] Remove or secure the `POST/PUT/DELETE /api/products` endpoints with authentication
