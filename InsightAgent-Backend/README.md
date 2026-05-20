# 📊 InsightAgent Backend

AI-powered NestJS API that transforms CSV files into queryable databases with natural language processing.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

- 🤖 **AI-Powered Queries** - Natural language to SQL using Groq/Llama
- 🔐 **Authentication** - JWT-based auth with Role-Based Access Control (RBAC)
- 💳 **Subscription System** - Tiered usage limits with runtime configuration
- 👑 **Admin Dashboard** - User management, system analytics, and plan editing
- 📁 **Dynamic Tables** - Upload CSV, instantly create queryable tables
- 🔗 **Smart JOINs** - Auto-detect table relationships
- ⚡ **Redis Caching** - Fast response times
- 🔒 **Secure** - Read-only queries, CORS protection

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start server
npm run start:dev
```

API runs at `http://localhost:3001/api`

## 🌍 Deploy on Render

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:prod` |

### Environment Variables
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
GROQ_API_KEY=gsk_...
REDIS_URL=redis://...
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=production
PORT=3001

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Polar Payments
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_ORGANIZATION_ID=...
POLAR_WEBHOOK_SECRET=polar_whs_...
POLAR_STARTER_PRODUCT_ID=...
POLAR_GROWTH_PRODUCT_ID=...
POLAR_POWER_PRODUCT_ID=...
```

## 📚 API Endpoints

All endpoints except public checkouts/webhooks require a valid Clerk Bearer JWT in the `Authorization` header.

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Projects** | POST | `/api/projects` | Create a new project |
| | GET | `/api/projects` | Get all projects for current user |
| | GET | `/api/projects/:id` | Fetch specific project details |
| | GET | `/api/projects/:id/tables` | Get metadata for project tables |
| | PATCH | `/api/projects/:id` | Rename / update project details |
| | DELETE | `/api/projects/:id` | Delete project and associated tables |
| **Upload** | POST | `/api/upload` | Upload CSV and parse into project scope |
| | DELETE | `/api/upload/:projectId/:tableName` | Drop dynamic table and delete metadata |
| **Agent** | POST | `/api/agent/query` | Process NL query and return visualization & data |
| | GET | `/api/agent/preview/:projectId/:tableName` | Fetch first 10 rows for preview |
| **Subscription** | GET | `/api/subscription/usage` | Fetch current usage stats & credits balance |
| | GET | `/api/subscription/plans` | Fetch available checkout packs |
| | POST | `/api/subscription/checkout` | Create checkout session for Polar |
| **Polar Webhooks** | POST | `/api/polar/webhook` | Process Polar webhooks (credit fulfillment) |
| **User Profile** | GET | `/api/users/me` | Fetch active user credentials and limits |
| | PATCH | `/api/users/me` | Update profile information |
| **Admin Panel** | GET | `/api/users/stats` | View total system metadata stats |
| | GET | `/api/users` | List and search all registered users (paginated) |
| | GET | `/api/users/:id` | Fetch individual user statistics |
| | PATCH | `/api/users/:id/credits` | Direct credits administration modification |
| | PATCH | `/api/users/:id/role` | Grant/revoke Admin role for user |
| | DELETE | `/api/users/:id` | Hard delete user and user's projects |

## 🛠️ Tech Stack

- **NestJS** - Framework
- **PostgreSQL** - Database (Prisma ORM)
- **Groq AI** - Llama 3.3-70b
- **Redis** - Caching
- **TypeScript** - Language

## 📝 License

MIT
