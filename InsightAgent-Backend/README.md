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
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
REDIS_URL=redis://...
NODE_ENV=production
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List projects |
| POST | `/api/upload` | Upload CSV |
| GET | `/api/subscription/plans` | Fetch all plans |
| PUT | `/api/subscription/plans/:tier` | Update plan limits (Admin) |
| POST | `/api/agent/query` | AI query |

## 🛠️ Tech Stack

- **NestJS** - Framework
- **PostgreSQL** - Database (Prisma ORM)
- **Groq AI** - Llama 3.3-70b
- **Redis** - Caching
- **TypeScript** - Language

## 📝 License

MIT
