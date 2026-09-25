# PawMart Server

<p align="center">
  <strong>Express + MongoDB backend for the PawMart pet adoption and supplies platform.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Firebase_Admin-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase Admin" />
</p>

<p align="center">
  <a href="https://pawmart-server-black.vercel.app">Live Server</a>
  ·
  <a href="https://pawmart-adf30.web.app">Live Client</a>
  ·
  <a href="https://github.com/harunhira69/PawMart-client">Client Repository</a>
</p>

---

## Overview

PawMart Server is the backend for a pet adoption and pet supplies marketplace. It exposes APIs for products, user-created listings, item details, orders, category filtering, and recent items.

The server uses MongoDB for persistence and Firebase Admin for ID-token verification on protected operations.

> **Security note:** the current codebase applies Firebase token verification to the listing-delete route. Other write routes are not yet protected server-side and should be hardened before treating the API as production-ready.

## Implemented API Areas

- Product listing and category filtering
- User-created marketplace listings
- Listing update and delete operations
- Combined products + listings feed
- Item detail lookup
- Order creation and retrieval
- Order deletion
- Recent/random item feed
- Firebase Admin token verification middleware
- MongoDB ObjectId-based data access

## Architecture

```text
React Client
    │
    ▼
Express API
    │
    ├── Products
    ├── Listings
    ├── Orders
    └── Firebase token verification
    │
    ▼
MongoDB
```

## Collections

The current database uses:

- `Products`
- `Listings`
- `order`

## API Surface

### Products & Discovery

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health response |
| `GET` | `/Products` | Get all products |
| `GET` | `/Products/:category` | Filter products by category |
| `GET` | `/all-item` | Combine products and listings |
| `GET` | `/item/:id` | Get a product or listing by ID |
| `GET` | `/recent-listings` | Return six sampled products |

### Listings

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/Listings` | Create a listing |
| `GET` | `/my-listings?email=` | Get listings by email |
| `PUT` | `/my-listings/:id` | Update a listing |
| `DELETE` | `/my-listings/:id` | Delete a listing with Firebase token verification |

### Orders

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/order` | Create an order |
| `GET` | `/order?email=` | Get orders for a buyer email |
| `DELETE` | `/order/:id` | Delete an order |
| `GET` | `/myOrder` | Get all orders |

## Authentication Middleware

The server decodes Firebase service-account credentials from the `FIREBASE_KEY` environment variable and verifies Firebase ID tokens with Firebase Admin.

The middleware expects:

```http
Authorization: Bearer <firebase-id-token>
```

At present, that middleware is used on:

```text
DELETE /my-listings/:id
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| API | Express.js 5 |
| Database | MongoDB |
| Authentication verification | Firebase Admin |
| Environment | dotenv |
| CORS | cors |

## Local Development

### 1. Clone

```bash
git clone https://github.com/harunhira69/PawMart-server.git
cd PawMart-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file:

```env
PORT=3000

DB_USER=
DB_PASS=

FIREBASE_KEY=
```

`FIREBASE_KEY` should contain the Base64-encoded Firebase service-account JSON expected by the current server implementation.

Never commit real credentials.

### 4. Start development server

```bash
npm run dev
```

Or:

```bash
npm start
```

## Current Improvement Opportunities

The current implementation is functional, but the next backend-hardening steps should include:

- Apply authentication middleware consistently to sensitive write/read routes
- Verify resource ownership before update/delete operations
- Validate request payloads
- Restrict CORS origins for production
- Separate routes/controllers/services from the single server file
- Add centralized error handling
- Add tests for protected and CRUD workflows
- Replace email query trust with authenticated identity where applicable

These are documented as future improvements rather than represented as already completed features.

---

## Author

**Harun Hira**  
Backend-Focused Full Stack Developer

- GitHub: https://github.com/harunhira69
- LinkedIn: https://www.linkedin.com/in/harunmern/
- Portfolio: https://portfolio-harun-liard.vercel.app/
