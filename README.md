# TechNova — Electronics & Tech Gadgets Store

A full-stack, responsive e-commerce application for an electronics retailer (phones, laptops, smart devices, accessories), built for the DartCodes Software Engineer Intern technical assessment.

- **Live site:** `https://technova-ecommerce-ten.vercel.app/`  
- **Admin panel:** `/admin/login`
- **Repository:** https://github.com/ThulaniThehara/technova-ecommerce

## Demo credentials (assessment only)

| | |
| --- | --- |
| Admin email | `admin@technova.lk` |
| Admin password | `Admin@12345` |
| Customer account | Create one at `/signup` (takes a minute). Checkout requires an account |
| PayHere sandbox test card | `4916217501611292`, any future expiry, any CVV |

These are throw-away demo values for evaluation. The password is stored only as a bcrypt hash.

## Features

**Customer**
- Product catalogue with case-insensitive search and category filters (state kept in the URL, so results are shareable and survive a refresh)
- Product details with a stock indicator and a quantity selector capped at available stock
- **Browse, search and build a cart as a guest** (no account needed). The guest cart is kept in the browser with quantity limits and a live badge
- **Customer accounts** (sign up / sign in), required only at checkout. Signing in sends you straight back to checkout with your cart intact
- **A saved cart that follows you across devices**: add items on a laptop, sign in on your phone and the same cart is there
- Checkout with two options: **PayHere Sandbox** online payment, or **Order via WhatsApp**. The form is prefilled from your account
- **My Account** with separate tabs: Overview (counts and recent orders), **My Orders**, Profile and Logout
- **My Orders and order tracking**: status filter, order-number search, a table on desktop and cards on mobile, and a **Track Your Order** timeline (Placed, Confirmed, Processing, Shipped, Delivered) built from real status history. Cancelled orders show a separate cancelled state
- A refreshed sign-in / sign-up design with a brand panel on large screens (no social login)
- Order confirmation page whose payment status is read from the database, never from the browser
- Animated 3D hero (React Three Fiber) with a static-image fallback when WebGL is unavailable
- Fully responsive; verified with no horizontal overflow at 375, 768 and 1440 px

**Admin**
- Secure login, dashboard (total orders, revenue from **paid** orders only, pending orders, low-stock count, recent orders)
- Products: add and edit with one shared validated form, inline stock editing, active/inactive toggle, delete only when a product has never been ordered
- Orders: status filter, detail view (address, line items), status dropdown, manual payment status for WhatsApp orders, cancel with automatic stock restore

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL on Neon |
| ORM | Prisma 7 with the `pg` driver adapter |
| Validation | Zod 4 (same schemas on client and server) |
| Auth | bcryptjs + signed JWT (`jose`) in an httpOnly cookie |
| Payments | PayHere Sandbox |
| 3D hero | three.js, @react-three/fiber, @react-three/drei |
| Hosting | Vercel + Neon |

## Local setup

```bash
git clone https://github.com/ThulaniThehara/technova-ecommerce.git
cd technova-ecommerce
npm install               # also runs `prisma generate`
cp .env.example .env      # then fill in the values (see below)
npx prisma migrate deploy # create the tables
npx prisma db seed        # 4 categories, 14 products, 1 admin
npm run dev               # http://localhost:3000
```

Before submitting or deploying: `npm run lint && npm run build`.

### Environment variables

| Variable | Purpose | Secret? |
| --- | --- | --- |
| `DATABASE_URL` | Neon pooled connection string (used by the app) | **Yes** |
| `DIRECT_URL` | Optional non-pooled Neon string, used by migrations if set | **Yes** |
| `JWT_SECRET` | Signs admin sessions. Random, 32+ characters | **Yes** |
| `PAYHERE_MERCHANT_ID` | PayHere sandbox merchant id | No (but kept server-side) |
| `PAYHERE_MERCHANT_SECRET` | PayHere secret for **your domain**. Verifies payments | **Yes** |
| `NEXT_PUBLIC_APP_URL` | Public site URL, used to build PayHere return/notify URLs. No trailing slash | No |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Business WhatsApp number, international format | No (it appears in the `wa.me` link) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Optional: override the demo admin when seeding | — |

Only the two `NEXT_PUBLIC_*` values reach the browser, and neither is a secret. `.env` is git-ignored and was never committed.

## Architecture

A modular monolith: one Next.js app holds the storefront, the admin panel and the API, and Prisma talks to Neon.

```
Browser ──► Next.js (App Router)
              ├─ Server Components  → read the database directly for pages
              ├─ Route Handlers     → /api/*  (validated, same {success, message} format)
              ├─ proxy.ts           → first gate for /admin and /api/admin
              └─ lib/               → business logic (orders, payments, auth, validation)
                       │
                       ▼
                 Prisma ──► PostgreSQL (Neon)        PayHere Sandbox  ◄─► /api/payments/payhere/*
```

```
app/            pages and API routes (admin pages are in the (panel) route group)
components/     admin, cart, checkout, hero (3D), layout, products, ui
lib/            orders.ts, payhere.ts, auth.ts, validations.ts, admin-*.ts, ...
prisma/         schema.prisma, migrations/, seed.ts
proxy.ts        admin route protection
```

Pages query Prisma directly as Server Components. The API routes exist as the public contract and are what the client-side forms call.

## Database design

```
Category 1 ──── * Product
Order    1 ──── * OrderItem
Product  1 ──── * OrderItem
User     1 ──── * Order          (the customer who placed it)
User     1 ──── 1 Cart 1 ──── * CartItem * ──── 1 Product
```

| Model | Key fields |
| --- | --- |
| `User` | email (unique), `phone`, `passwordHash`, `role` (`CUSTOMER` or `ADMIN`, always set explicitly in code, no default) |
| `Category` | name, slug (unique) |
| `Product` | slug (unique), `price`, `stock`, `imageUrl`, `isActive`, `categoryId`, indexed on category and `isActive` |
| `Order` | `orderNumber`, `userId` (owner), customer fields (a snapshot), `total`, `paymentMethod`, `paymentStatus`, `orderStatus`, `payherePaymentId` |
| `Cart` / `CartItem` | one saved cart per customer; only product ids and quantities (names, prices and stock are always read fresh) |
| `OrderItem` | `productId`, **`productName` and `unitPrice` snapshots**, `quantity` |

Enums: `Role` (ADMIN, CUSTOMER), `PaymentMethod` (PAYHERE, WHATSAPP), `PaymentStatus` (PENDING, PAID, FAILED), `OrderStatus` (PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELLED). `COMPLETED` is shown to customers as "Delivered". A new `OrderStatusHistory` table (status, note, time) stores the tracking timeline.

Key decisions:
- **Money is `Decimal(10,2)`**, never floating point. PayHere amounts are formatted to exactly two decimals.
- **Order lines snapshot the product name and price**, so history stays correct if a product is later renamed or repriced.
- **Order numbers are an auto-increment integer** shown as `TN-0001`.
- **Payment status and order status are separate**: a paid order can still be awaiting fulfilment.
- **Order tracking**: every status change writes a row to `OrderStatusHistory`, and the customer's "Track Your Order" timeline (My Orders, then the order) is read from it, so every date shown really happened. Admins move an order forward only (Pending, Confirmed, Processing, Shipped, Delivered) or cancel it before delivery; cancelling returns the stock. `PATCH /api/admin/orders/[id]/status` is admin-only. A customer only ever sees their own orders (another customer's order id returns 404).
- **Orders also snapshot the customer details** (name, email, phone, address), so changing a profile later never rewrites old orders. `Order.userId` records the owner.
- **Deletes are restricted**: a product that appears on any order cannot be deleted, only deactivated (`isActive = false` hides it from the store). A category with products cannot be deleted.

## Customer accounts and checkout flow

```
Guest browses, searches, adds to cart  ->  Cart  ->  "Proceed to Checkout"
  not signed in?  ->  /login?redirect=/checkout  (cart untouched)  ->  Sign in or Create account
  ->  back on /checkout with the cart and the form prefilled  ->  PayHere or WhatsApp
  ->  order saved under the account  ->  My Account > My Orders > Order details
```

- Guests can use the whole catalogue and the cart. **Only checkout, the account pages and order history require a customer account.**
- Customers and admins are **separate**: different login routes (`/login` and `/admin/login`), different cookies and different lifetimes (7 days and 8 hours). An admin account cannot be used to check out, and a customer cannot reach the admin panel.
- **The saved cart.** Signed in, the cart is stored in the database so it follows the customer between devices. On sign-in the browser cart is **merged once** with the saved one (same product: quantities add up, capped at stock). After that the browser copy is a mirror: it pulls from the server on load and pushes each change a moment later. Placing an order empties the saved cart inside the order transaction, so ordered items cannot come back. Signing out clears the browser copy (so the next person on a shared device does not inherit it); the saved cart stays on the server for the next sign-in.
- **Order ownership.** The order's `userId` comes only from the verified session cookie, never from the request. Order lists, order details, the confirmation page, the status poller and PayHere payment start are all scoped to the signed-in owner. Someone else's order looks exactly like a missing one (404).
- **Open-redirect safe.** The `?redirect=` target is validated, and only same-site paths are accepted.

## Stock policy

Stock is handled the same way everywhere, and it is the rule to remember:

1. **Decrement when the order is created**, inside one database transaction. Each line uses a conditional update, `UPDATE ... WHERE stock >= quantity`, so two simultaneous buyers can never oversell. If any line fails, the whole order is rolled back.
2. **Restore when an order becomes `CANCELLED`**, whether the admin cancels it or a PayHere payment fails (status `-1` or `-2`).
3. **Restore exactly once.** Both paths go through one function, `cancelOrderAndRestoreStock`, which only restores stock if it is the call that actually flips the order to `CANCELLED`. An admin cancel racing a late PayHere failure notice, or five simultaneous cancel clicks, restores the stock one time.

Related rules: a cancelled order is final (it cannot be re-opened, because that would need stock taken again); a completed order cannot be cancelled; a WhatsApp order's stock is held until the admin cancels it.

## Payment flows

### PayHere Sandbox

1. Checkout validates the form and creates a `PENDING` order on the server (prices and total come from the database, never the browser).
2. `POST /api/payments/payhere` loads that order and returns the form fields plus a hash computed **on the server**:
   `md5(merchant_id + order_id + amount + "LKR" + md5(merchant_secret).toUpperCase()).toUpperCase()`.
   The browser then submits a real `<form>` POST to `sandbox.payhere.lk/pay/checkout`.
3. PayHere calls `POST /api/payments/payhere/notify` server-to-server (`return_url` is cosmetic). The handler accepts the payment only if **all** of these hold:
   - `merchant_id` matches ours
   - `md5sig` equals `md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(secret))` (compared in constant time)
   - the order exists and the paid **amount and currency equal the order total**
   - the order's payment is still `PENDING`
4. On `status_code 2` the order becomes `PAID` / `CONFIRMED`. On `-1` or `-2` it becomes `FAILED` / `CANCELLED` and the stock is restored. Other codes change nothing.
5. The handler always answers `200`. A conditional update on `paymentStatus = PENDING` makes it **idempotent**: a repeated notification changes nothing.
6. The return page polls `GET /api/orders/:id/status` and shows what the database says. It never trusts the redirect.

The secret never leaves the server (no `NEXT_PUBLIC_` prefix). The notify URL must be publicly reachable, so the payment flow completes only on the deployed site, not on `localhost`.

### Order via WhatsApp

1. The order is validated and saved first (`WHATSAPP` / `PENDING`), which also reserves the stock.
2. The message is built from the **saved order** returned by the API, not from the cart: order number, customer, phone, delivery address, line items with prices, and total.
3. The browser goes to `https://wa.me/<number>?text=<encoded message>` using `window.location.href` (mobile browsers block popups opened after an `await`). The cart is then cleared, and a fallback screen with a resend button is shown.

## Security approach

- **Authentication:** passwords hashed with bcrypt (12 rounds). Login issues an HS256 JWT (role claim; 8 hours for admins, 7 days for customers) in an `httpOnly`, `SameSite=Lax`, `Secure`-in-production cookie, with **separate cookies for admins and customers**. Login errors are one generic message with similar timing for unknown emails, plus a small attempt limiter. Sign-up enforces password strength (8+ characters with an uppercase letter, a lowercase letter and a digit), unique emails and a Sri Lankan phone number, and the **role is always set by the server** (a `role` in the request body is ignored).
- **Authorisation, checked twice:** `proxy.ts` is the first gate for `/admin/*`, `/api/admin/*`, `/checkout` and `/account/*`. Every admin API handler calls `requireAdmin()` and every customer API handler calls `requireCustomer()`. Both re-verify the token **and** look the user up in the database, and every protected page re-checks in its layout. A proxy bypass therefore never exposes data.
- **Server is the source of truth:** unit prices, totals and stock are always recomputed from the database. Client values are ignored, and the checkout schema has no price field at all.
- **Validation:** Zod on both client and server. Admin updates reject unknown fields (no mass assignment), and image URLs must be `http(s)`.
- **Payments:** hash and verification as described above. Amounts are compared against the order total.
- **Errors:** every route handler is wrapped in try/catch and returns `{ success, message }`. Stack traces and database errors stay in the server log.
- **Secrets:** `.env` is ignored and never committed (checked with `git log --all -- .env`). A scan of the production bundle, the full git history and all tracked files found none of the secret values.
- **Headers:** `nosniff`, `X-Frame-Options: DENY`, referrer and permissions policies, HSTS, no `X-Powered-By`, and `no-store` on admin responses.

## API summary

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/products?q=&category=` | Public (active products only) |
| GET | `/api/products/:idOrSlug` | Public |
| POST | `/api/orders` | **Customer** (401 otherwise), validated |
| GET | `/api/orders/:id/status` | Order owner (status fields only) |
| POST | `/api/payments/payhere` | Order owner; the order must be a pending PayHere order |
| POST | `/api/payments/payhere/notify` | PayHere only (signature verified) |
| POST | `/api/auth/signup` · `/api/auth/login` | Public (customer) |
| GET | `/api/auth/me` | Customer |
| POST | `/api/auth/logout` | Public (clears both session cookies) |
| POST | `/api/auth/admin/login` | Public (admin) |
| GET | `/api/account/orders?status=` · `/api/account/orders/:id` | Customer (own orders only) |
| PATCH | `/api/account/profile` | Customer (name and phone) |
| GET, PUT | `/api/cart` and POST `/api/cart/merge` | Customer (saved cart) |
| GET | `/api/admin/dashboard` | Admin |
| GET, POST | `/api/admin/products` | Admin |
| GET, PATCH, DELETE | `/api/admin/products/:id` | Admin |
| GET | `/api/admin/orders?status=` | Admin |
| GET, PATCH | `/api/admin/orders/:id` | Admin |
| PATCH | `/api/admin/orders/:id/status` | Admin (`{ "status": "SHIPPED" }`, forward-only, writes the tracking history) |

## Manual test checklist

Run on the live site in a private window.

- [ ] Browse, search (try different letter cases), filter by category, open a product
- [ ] Add to cart as a guest, change quantities, refresh and confirm the cart persists
- [ ] Click Proceed to Checkout while signed out: you are sent to sign in, and the cart is still there
- [ ] Create an account: you land back on checkout with the cart and the form prefilled
- [ ] Sign in on a second device or browser: the same cart appears
- [ ] After ordering, My Orders shows the order; another customer cannot open it
- [ ] In the admin panel move the order Confirmed, Processing, Shipped, Delivered: after each change the customer's Track Your Order timeline updates on reload
- [ ] Cancel an order: the customer sees the cancelled state and the stock returns
- [ ] Checkout with invalid data shows field errors; an out-of-stock item is rejected
- [ ] WhatsApp order: the message is readable, the order is in the database and stock went down
- [ ] PayHere order: after paying with the sandbox card the order becomes **Paid** through the notification
- [ ] Cancel a PayHere payment: the order becomes Cancelled and stock returns
- [ ] Wrong admin password is rejected; admin APIs return 401 when logged out
- [ ] Admin: create, edit, deactivate a product; edit stock; update an order's status; cancel an order and see stock restored
- [ ] Check 375, 768 and 1440 px widths

During development the order, payment, cancellation, authentication and error-handling logic was exercised with scripted checks, including concurrent buyers, replayed and forged PayHere notifications, and racing cancellations. No automated test suite is committed to this repository.

## Important decisions and trade-offs

- **One Next.js app instead of separate frontend and backend:** one codebase and one deploy, which fits a 72-hour scope.
- **PostgreSQL + Prisma:** products, orders and line items are relational, and transactions are needed for stock.
- **Accounts only where they matter:** browsing and the cart stay open to guests, and an account is required at checkout so every order has an owner and can be tracked. The cart shown in the browser is display-only; the server re-checks prices, stock and ownership.
- **Soft deactivation instead of deleting products:** past orders keep their history.
- **Hosted payment page:** card details are entered on PayHere, so they never touch this server.
- **3D hero lazy-loaded:** the headline and buttons paint first; the heavy 3D code loads afterwards and the hero degrades to a still image if WebGL fails.

## Assumptions and limitations

- **Single currency (LKR)**, no taxes, and delivery cost is "confirmed after order" rather than calculated.
- **PayHere is sandbox only.** The sandbox merchant account has a per-payment limit, so very expensive baskets may be refused by PayHere itself. Test with a lower-priced item.
- **Refunds are manual.** If an admin cancels an order that was already paid, the money must be refunded in PayHere by hand.
- **WhatsApp orders are confirmed by a person.** Marking one as paid is a manual admin action, and the order holds its stock until then.
- **The login attempt limiter is in memory.** On serverless hosting each instance has its own counter, so it slows brute force down rather than stopping it. A shared store (e.g. Redis) would be needed in production.
- **Product images are URLs**, not uploads. An empty URL uses a placeholder image.
- **3D products are placeholders.** The hero uses built-in 3D models; put real `.glb` files in `public/models/` (names in `public/models/README.md`) to replace them without code changes.
- **Customer accounts are deliberately simple:** no email verification, no password reset or change-password page, and no social login. A forgotten password currently needs an admin to reset it in the database.
- **Orders placed before accounts existed have no owner.** Admins can see them, but they appear in no customer's "My Orders".
- **Shared cart edge case:** if the same account is edited on two devices at the same moment, the last save wins.
- No order emails/SMS, reviews or coupons (out of scope).

## Possible improvements

Email verification and password reset, image upload (e.g. Cloudinary), email or WhatsApp notifications on status changes, a shared rate-limit store, pagination for large order lists, automated unit and end-to-end tests, and a strict Content-Security-Policy.
