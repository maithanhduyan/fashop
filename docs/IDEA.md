# Fashop — E-Commerce Platform

> **Tech Stack:** Next.js · Golang · PostgreSQL · Redis · Docker
> **Deploy:** Railway (monorepo) · GitHub Actions CI/CD
> **Triết lý:** Bắt đầu đơn giản, đo lường bottleneck, rồi mới scale. Không over-engineer.

---

## Monorepo Structure

```
fashop/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── Dockerfile
│   │   └── ...
│   └── api/                  # Golang backend (modular monolith → tách service sau)
│       ├── Dockerfile
│       ├── cmd/server/       # Entrypoint
│       ├── internal/
│       │   ├── auth/         # Module: đăng ký, đăng nhập, JWT
│       │   ├── product/      # Module: CRUD sản phẩm, tìm kiếm
│       │   ├── cart/         # Module: giỏ hàng
│       │   ├── order/        # Module: đặt hàng, trạng thái
│       │   ├── payment/      # Module: tích hợp payment gateway
│       │   ├── inventory/    # Module: quản lý tồn kho
│       │   └── notification/ # Module: email, push
│       └── pkg/              # Shared utilities (logger, middleware, config)
│           ├── database/
│           ├── middleware/
│           └── config/
├── docker-compose.yml        # Local dev (PG + Redis + API + Web)
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD pipeline
├── docs/
│   └── IDEA.md
└── README.md
```

**Railway setup:** 1 project, mỗi app là 1 service trỏ cùng repo, khác **Root Directory** (`apps/web`, `apps/api`). Các service dùng chung Railway **Private Network** để gọi nhau qua internal URL.

---

## CI/CD Pipeline (GitHub Actions → Railway)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: fashop_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.22"
      - run: cd apps/api && go test ./... -race -cover

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd apps/web && npm ci && npm run lint && npm run build

  deploy-api:
    needs: test-api
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/cli-action@v1
        with:
          service: api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-web:
    needs: test-web
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/cli-action@v1
        with:
          service: web
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

**Luồng CI/CD:**
1. Push code lên `main` → GitHub Actions trigger
2. Chạy test song song (Go tests + Next.js lint/build)
3. Test pass → Railway CLI deploy từng service
4. Railway tự build Docker image từ Dockerfile trong Root Directory

---

## PHASE 1 — MVP (Modular Monolith)

> **Mục tiêu:** Ship sản phẩm ra thị trường nhanh nhất. Toàn bộ backend là 1 Go binary duy nhất, chia module rõ ràng bên trong.
> **Người dùng:** 0 → 10K
> **Railway cost:** ~$5-20/tháng

### Kiến trúc Phase 1

```
[ Next.js (SSR/ISR) ]
        |
  [ Golang API - Modular Monolith ]
   (auth | product | cart | order | payment | inventory)
        |               |
  [ PostgreSQL ]    [ Redis ]
   (1 database,      (session,
    all tables)       cart cache)
```

### Chi tiết

#### Backend: 1 Go binary, nhiều module
- **Framework:** Gin hoặc Fiber
- **Database:** sqlx hoặc GORM — 1 PostgreSQL database duy nhất chứa tất cả tables
- **Cấu trúc module:** Mỗi domain (auth, product, order...) là 1 package trong `internal/`, có handler + service + repository riêng. **Không import chéo giữa các module** — giao tiếp qua interface. Đây là nền tảng để tách microservice sau này.

#### Database Schema (quan trọng từ đầu)
```sql
-- Auth
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product
CREATE TABLE categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price       BIGINT NOT NULL,            -- Đơn vị: đồng (VND), tránh float
    category_id INT REFERENCES categories(id),
    image_urls  TEXT[],                      -- PostgreSQL array
    status      VARCHAR(20) DEFAULT 'active',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory (tách bảng riêng, không nhét vào products)
CREATE TABLE inventory (
    product_id  BIGINT PRIMARY KEY REFERENCES products(id),
    quantity    INT NOT NULL DEFAULT 0,
    reserved    INT NOT NULL DEFAULT 0,      -- Số lượng đang giữ chỗ (checkout chưa pay)
    version     INT NOT NULL DEFAULT 0,      -- Optimistic locking
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Cart (persist vào Redis cho guest, PG cho logged-in user)
CREATE TABLE cart_items (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id),
    product_id BIGINT REFERENCES products(id),
    quantity   INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Order
CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending → paid → shipping → completed → cancelled
    total_amount    BIGINT NOT NULL,
    shipping_address JSONB,
    idempotency_key UUID UNIQUE,             -- Chống duplicate submit
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT REFERENCES orders(id),
    product_id BIGINT REFERENCES products(id),
    quantity   INT NOT NULL,
    price      BIGINT NOT NULL              -- Snapshot giá tại thời điểm mua
);

-- Payment
CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT REFERENCES orders(id),
    provider        VARCHAR(50) NOT NULL,    -- 'stripe', 'vnpay', 'momo'
    provider_tx_id  VARCHAR(255),            -- ID giao dịch từ payment gateway
    amount          BIGINT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    idempotency_key UUID UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes quan trọng
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
```

#### Chống Overselling (Phase 1 — Optimistic Locking)
PostgreSQL đủ mạnh cho giai đoạn này. Không cần Redis Lua script.

```go
// inventory/repository.go
func (r *Repo) ReserveStock(ctx context.Context, tx *sql.Tx, productID int64, qty int) error {
    result, err := tx.ExecContext(ctx, `
        UPDATE inventory
        SET reserved = reserved + $1, version = version + 1
        WHERE product_id = $2
          AND quantity - reserved >= $1
          AND version = $3`,
        qty, productID, currentVersion)
    if err != nil {
        return err
    }
    rows, _ := result.RowsAffected()
    if rows == 0 {
        return ErrOutOfStock // hoặc ErrVersionConflict → retry
    }
    return nil
}
```
- `quantity - reserved >= qty` đảm bảo không bán lố.
- `version` check tránh race condition (Optimistic Locking). Nếu 2 request đồng thời, 1 cái sẽ fail → retry.
- Toàn bộ trong 1 DB transaction cùng với tạo order → **Strong Consistency**.

#### Frontend (Next.js)
- **ISR** cho trang sản phẩm (revalidate mỗi 60s)
- **Zustand** cho state management (cart, auth)
- **Server Actions** (Next.js 14+) cho form submit (checkout, login)

#### Auth
- JWT access token (15 min) + refresh token (7 days, lưu httpOnly cookie)
- Password hash bằng **bcrypt**
- Middleware verify JWT ở tầng Go, không verify ở mỗi module

#### Payment
- Tích hợp 1 gateway (VNPay hoặc Stripe)
- **Idempotency key** từ frontend (UUID) → lưu trong bảng `orders` + `payments`, nếu key trùng → return kết quả cũ
- Webhook handler: verify signature → update order status trong 1 transaction

#### Railway Services (Phase 1)

| Service       | Railway Type     | Config                          |
|---------------|------------------|---------------------------------|
| `web`         | Web Service      | Root: `apps/web`, Port: 3000    |
| `api`         | Web Service      | Root: `apps/api`, Port: 8080    |
| `postgres`    | Database Plugin  | PostgreSQL 16                   |
| `redis`       | Database Plugin  | Redis 7                         |

- `web` gọi `api` qua Railway private network: `http://api.railway.internal:8080`
- Environment variables quản lý bằng Railway Variables (không commit `.env`)

#### Checklist Phase 1

- [ ] Monorepo setup (apps/web + apps/api)
- [ ] Docker Compose cho local dev
- [ ] Go API: auth module (register, login, JWT refresh)
- [ ] Go API: product module (CRUD, list với pagination, filter by category)
- [ ] Go API: cart module (add, remove, update quantity)
- [ ] Go API: order module (checkout flow, order history)
- [ ] Go API: inventory module (optimistic locking, reserve/release)
- [ ] Go API: payment module (1 gateway, webhook, idempotency)
- [ ] Database migrations (golang-migrate)
- [ ] Next.js: trang chủ, danh sách SP, chi tiết SP (ISR)
- [ ] Next.js: giỏ hàng, checkout, lịch sử đơn hàng
- [ ] Next.js: auth pages (login, register)
- [ ] CI/CD: GitHub Actions → Railway deploy
- [ ] Observability cơ bản: structured logging (zerolog/slog)

---

## PHASE 2 — Scale & Tách Service

> **Trigger chuyển Phase:** Traffic tăng, response time API > 200ms p95, hoặc team > 3 devs cần làm song song.
> **Người dùng:** 10K → 100K
> **Thêm:** Redis cache layer, tách service đầu tiên, message queue, full-text search

### Kiến trúc Phase 2

```
[ Next.js + CDN (Cloudflare) ]
        |
  [ API Gateway (Go reverse proxy / Nginx) ]
        |                       |
[ Core API Service ]    [ Order Service ]    ← Tách service đầu tiên
  (auth|product|cart|      (order|payment|
   inventory)               notification)
   |          |               |          |
[PG Main]  [Redis]       [PG Orders]  [Redis]
               |
          [ RabbitMQ / NATS ]  ← Message queue nhẹ, chưa cần Kafka
               |
        [ Worker Service ]
        (email, inventory sync)
```

### Những gì thêm mới

#### 2.1 Tách Order Service ra khỏi monolith
- **Lý do:** Order + Payment là domain phức tạp nhất, có lifecycle riêng, cần scale độc lập.
- **Giao tiếp:** REST API nội bộ qua Railway private network cho sync calls. **RabbitMQ/NATS** cho async events (nhẹ hơn Kafka rất nhiều, đủ cho 100K users).
- Order Service có DB riêng (`PG Orders`) → loose coupling.

#### 2.2 Event-Driven cho luồng checkout
```
User checkout
    → Core API: validate cart, reserve stock (PG optimistic lock)
    → Core API: gọi Order Service tạo order (sync REST)
    → Order Service: tạo order PENDING, return order_id
    → User thanh toán
    → Payment webhook → Order Service update PAID
    → Order Service publish event "OrderPaid" → RabbitMQ
    → Worker: gửi email confirmation
    → Worker: gọi Core API release reserved → confirm stock deduction
```

#### 2.3 Redis Cache Layer
- Cache product list, product detail (TTL 60s) → giảm tải PG
- Cache inventory count → fast stock check trước khi hit DB
- Session store cho rate limiting tại gateway

#### 2.4 Full-text Search
- **Meilisearch** (nhẹ hơn ElasticSearch rất nhiều, đủ cho Phase 2)
- Sync data từ PG → Meilisearch bằng Go worker đọc event từ queue
- Railway có thể deploy Meilisearch như 1 Docker service

#### 2.5 Observability nâng cấp
- **OpenTelemetry** SDK trong Go → traces gửi về **Jaeger** (hoặc Railway logging)
- **Prometheus metrics** expose từ mỗi service → Grafana dashboard
- **Structured logging** với correlation ID (trace mỗi request qua nhiều service)
- **Alerting:** Uptime Robot hoặc BetterStack cho health check endpoint

#### 2.6 Security hardening
- Rate limiting ở API Gateway (Redis-based sliding window)
- Input validation middleware (sanitize SQL, XSS)
- CORS whitelist
- Helmet headers trên Next.js
- Secrets quản lý qua Railway Variables (không dùng `.env` file)

#### Railway Services (Phase 2)

| Service        | Railway Type     | Config                              |
|----------------|------------------|-------------------------------------|
| `web`          | Web Service      | Root: `apps/web`                    |
| `api`          | Web Service      | Root: `apps/api`                    |
| `order`        | Web Service      | Root: `apps/order`                  |
| `worker`       | Worker Service   | Root: `apps/worker`                 |
| `postgres`     | Database Plugin  | Main DB                             |
| `pg-orders`    | Database Plugin  | Order Service DB                    |
| `redis`        | Database Plugin  | Cache + session                     |
| `rabbitmq`     | Docker Service   | Message queue                       |
| `meilisearch`  | Docker Service   | Full-text search                    |

#### Checklist Phase 2

- [ ] Tách Order + Payment thành service riêng (`apps/order`)
- [ ] Setup RabbitMQ/NATS trên Railway
- [ ] Event publish/subscribe cho OrderPaid, OrderCancelled
- [ ] Worker service xử lý async jobs (email, stock sync)
- [ ] Redis caching layer cho products + inventory
- [ ] Meilisearch cho tìm kiếm sản phẩm
- [ ] API Gateway (rate limiting, circuit breaker)
- [ ] OpenTelemetry tracing + Prometheus metrics
- [ ] Cloudflare CDN cho static assets + Next.js ISR pages
- [ ] Database migration strategy (zero-downtime migration)
- [ ] Contract testing giữa Core API ↔ Order Service

---

## PHASE 3 — Enterprise Scale

> **Trigger chuyển Phase:** 100K+ users, cần horizontal scaling, multiple teams, flash sale events.
> **Người dùng:** 100K → 1M+
> **Thêm:** Kafka, CQRS, Database partitioning, K8s (hoặc Railway Pro auto-scaling)

### Kiến trúc Phase 3

```
[ Next.js + Cloudflare CDN/WAF ]
                |
    [ API Gateway (Kong / Go) ]
    (rate limit, auth, circuit breaker)
                |
  ──────────────────────────────────────────
  |              |              |            |
[Auth        [Product       [Order       [Payment
 Service]     Service]       Service]     Service]
  |              |              |            |
[PG Auth]   [PG Products]  [PG Orders]  [PG Payments]
                 |
        [Debezium CDC → Kafka]
                 |
    ┌────────────┼────────────┐
    |            |            |
[Elastic    [Inventory    [Notification
 Search]     Service]      Workers]
(CQRS       (Redis +       (Email,
 Read)       PG source      Push, SMS)
             of truth)
```

### Những gì thêm mới

#### 3.1 Full Microservices
- Mỗi domain = 1 service + 1 database riêng (Database per Service)
- gRPC cho internal sync calls (thay REST, nhanh hơn 2-5x)
- Kafka làm event bus trung tâm (thay RabbitMQ)

#### 3.2 CQRS cho Product Catalog
- **Write:** Admin CUD sản phẩm → PostgreSQL
- **CDC:** Debezium đọc WAL → Kafka → Consumer đẩy vào ElasticSearch
- **Read:** User search/filter → ElasticSearch trực tiếp (không chạm PG)
- **Read-your-own-writes:** Sau khi admin tạo SP, redirect đến trang detail đọc từ PG (bypass ES lag)

#### 3.3 Inventory — Redis + PG (Source of truth = PG)
- Redis chỉ là **fast check layer** + **pre-lock** (Lua script atomic decrement)
- Source of truth vẫn là PostgreSQL: `UPDATE inventory SET qty = qty - 1 WHERE qty > 0`
- Cronjob mỗi 5 phút reconcile Redis ↔ PG, nếu lệch → alert + auto-fix từ PG
- Flash sale: pre-warm inventory count vào Redis trước event

#### 3.4 Saga Orchestrator
- Dùng **Orchestrator pattern** (không choreography) cho checkout flow phức tạp:
```
Saga Orchestrator:
  1. Reserve Inventory  → success → next
  2. Create Order       → success → next
  3. Process Payment    → success → complete
                        → fail    → Compensate: Cancel Order → Release Inventory
```
- Mỗi step persist trạng thái vào DB → crash recovery
- **Dead Letter Queue** cho event xử lý fail sau N lần retry → alert team

#### 3.5 Database Partitioning (trước khi Sharding)
- `orders` table partition theo `created_at` (range partitioning, mỗi tháng 1 partition)
  ```sql
  CREATE TABLE orders (...) PARTITION BY RANGE (created_at);
  CREATE TABLE orders_2026_03 PARTITION OF orders
      FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
  ```
- Chỉ dùng sharding (Citus) khi 1 PG node thực sự không đủ (thường > 500M records)
- Consistent hashing nếu phải shard (không dùng `user_id % N` vì khó resharding)

#### 3.6 Horizontal Scaling
- **Railway Pro:** auto-scaling replicas dựa trên CPU/memory
- Hoặc **migrate sang Kubernetes** (GKE/EKS) nếu cần fine-grained control:
  - HPA (auto-scale pods)
  - PodDisruptionBudget (zero-downtime deploy)
  - Istio service mesh (mTLS giữa services)

#### 3.7 Advanced Observability
- **Distributed tracing** end-to-end (OpenTelemetry → Jaeger)
- **Centralized logging** (Loki + Grafana hoặc ELK)
- **SLA dashboard:** p50/p95/p99 latency, error rate, Kafka consumer lag
- **Chaos testing** (Litmus): inject network failure, DB timeout → verify saga compensation
- **Load testing** (k6): simulate flash sale 10K concurrent users → tìm bottleneck trước khi scale

#### 3.8 Security (Production-grade)
- **mTLS** giữa services (Istio hoặc tự manage certs)
- **Secrets management:** HashiCorp Vault hoặc Railway Variables (encrypted)
- **PCI DSS:** KHÔNG lưu card number — dùng Stripe/VNPay tokenization
- **WAF:** Cloudflare rules chặn SQL injection, XSS, bot traffic
- **Audit log:** Mọi thao tác admin (tạo/sửa/xóa sản phẩm, refund) đều ghi log immutable

#### Railway Services (Phase 3)

| Service         | Type            | Notes                              |
|-----------------|-----------------|------------------------------------|
| `web`           | Web Service     | Next.js behind Cloudflare CDN      |
| `api-gateway`   | Web Service     | Kong hoặc Go gateway               |
| `auth`          | Web Service     | Auth service                       |
| `product`       | Web Service     | Product write service              |
| `order`         | Web Service     | Order + Saga orchestrator          |
| `payment`       | Web Service     | Payment service                    |
| `inventory`     | Web Service     | Inventory service                  |
| `worker`        | Worker          | Notification, sync, reconciliation |
| `postgres-*`    | Database × 4    | Per-service databases              |
| `redis`         | Database        | Cache + inventory fast-check       |
| `kafka`         | Docker Service  | Event bus (hoặc Upstash Kafka)     |
| `elasticsearch` | Docker Service  | CQRS read model                    |

> **Lưu ý Railway cost:** Phase 3 với nhiều services sẽ tốn $100-300+/tháng. Nếu budget hạn chế, cân nhắc dùng **Upstash Kafka** (serverless, pay-per-use) thay vì self-host Kafka trên Railway.

#### Checklist Phase 3

- [ ] Tách full microservices (auth, product, inventory, payment)
- [ ] Kafka setup + Debezium CDC từ Product DB
- [ ] CQRS: ElasticSearch làm read model cho product search
- [ ] Saga Orchestrator cho checkout flow + compensation
- [ ] Redis inventory pre-lock + PG source of truth + reconciliation
- [ ] Database partitioning cho orders table
- [ ] gRPC cho internal service communication
- [ ] API Gateway: Kong hoặc custom Go gateway
- [ ] Distributed tracing (OpenTelemetry → Jaeger)
- [ ] Centralized logging + alerting
- [ ] Load testing flash sale scenario (k6)
- [ ] Security audit: mTLS, WAF, audit log, PCI compliance
- [ ] Chaos testing cho saga compensation

---

## LUỒNG CHECKOUT (Tiến hóa qua 3 Phase)

### Phase 1 (Synchronous, 1 DB transaction)
```
Next.js → POST /checkout
  → Go API: BEGIN transaction
    → Validate cart items
    → Reserve inventory (optimistic lock)
    → Create order (PENDING)
    → COMMIT
  → Return order_id
  → User pay → webhook → UPDATE order SET status = 'paid'
```

### Phase 2 (Async events, 2 services)
```
Next.js → POST /checkout
  → Core API: reserve stock → call Order Service (REST)
  → Order Service: create order → return order_id
  → User pay → webhook → Order Service: update PAID
  → Publish "OrderPaid" → RabbitMQ
  → Worker: send email + confirm stock deduction
```

### Phase 3 (Saga Orchestrator, full microservices)
```
Next.js → POST /checkout → API Gateway
  → Order Service (Saga Orchestrator):
    Step 1: Inventory Service → reserve stock (Redis + PG)
    Step 2: Create order (PENDING)
    Step 3: Payment Service → process payment
    Step 4: Publish "OrderCompleted" → Kafka
  → Kafka Consumers:
    → Notification: email + push
    → Inventory: confirm deduction in PG
    → Analytics: track conversion
  → Failure at any step → Saga compensates (reverse previous steps)
```

---

## Nguyên tắc xuyên suốt

1. **Source of truth luôn là PostgreSQL** — Redis chỉ là cache/fast-check.
2. **Idempotent mọi thứ** — API endpoints, Kafka consumers, webhook handlers đều phải xử lý duplicate safely.
3. **Database migration trước, code sau** — Dùng `golang-migrate`, mỗi migration có cả `up` và `down`.
4. **Không commit secrets** — Railway Variables + `.env.example` cho local dev.
5. **Structured logging từ ngày đầu** — JSON log với request_id, user_id → dễ debug khi hệ thống phức tạp.
6. **Test before deploy** — CI chạy unit test + integration test → pass mới deploy. Không skip.
