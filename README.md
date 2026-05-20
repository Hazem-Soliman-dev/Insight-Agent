# InsightAgent - Agentic Business Intelligence System

AI-powered business intelligence platform — upload CSV files, ask questions in plain English, and get instant data visualizations.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-39827B?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Polar](https://img.shields.io/badge/Polar-4C3EF7?style=for-the-badge&logo=polar&logoColor=white)](https://polar.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)


### 🚀 Features

- **Multi-File CSV Upload**: Drag-and-drop multiple CSV files.
- **Dynamic Table Creation**: Automatic conversion of CSV files to PostgreSQL tables.
- **AI-Powered Queries**: Ask questions in plain English, powered by Groq (Llama 3.3-70b).
- **Smart JOIN Detection**: AI automatically detects and queries relationships between tables.
- **Auto-Visualization**: Query results automatically rendered as tables or interactive charts (bar, pie, line).
- **Real-time Processing**: Animated thinking UI displaying steps of LLM processing and SQL generation.
- **Clerk Authentication**: Secure registration, login, session management, and route protection using Clerk.
- **Polar Subscription & Credits**: Credit pack purchasing system integrated with Polar Sandbox checkouts and automated webhook-based credit fulfillment.
- **Admin Control Panel**: Full dashboard for managing user accounts, adjusting roles (User/Admin), modifying credit balances, and monitoring global system usage statistics.

## 🛠️ Tech Stack

### Backend
- **NestJS** - Scalable Node.js framework
- **Prisma** - Type-safe database client and ORM
- **PostgreSQL** - Relational database (hosted on Neon cloud)
- **Groq SDK** - Llama 3.3-70b integration for text-to-SQL logic
- **Clerk SDK** - Backend JWT verification and user synchronization
- **Polar SDK** - Checkout session generation and webhook signature verification
- **Redis** - In-memory database for performance-oriented caching

### Frontend
- **Next.js 14** - React framework with App Router
- **Clerk Components** - Seamless sign-in and register user flows
- **Shadcn/UI & Radix UI** - Accessible and beautiful UI components
- **Tailwind CSS** - Modern styling leveraging OKLCH color palettes
- **Recharts** - Dynamic and responsive charts for data visualization
- **React Dropzone** - Smooth CSV drag-and-drop functionality

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL instance (e.g. Neon connection string)
- Redis instance (e.g. Redis Labs / Upstash connection string)
- Groq API Key
- Clerk developer account (Publishable & Secret keys)
- Polar developer account (Organization ID, Access Token, Webhook Secret & Product IDs)

### Quick Start Setup

1. **Clone the repository and install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd InsightAgent-Backend
   npm install

   # Install frontend dependencies
   cd ../InsightAgent-Frontend
   npm install
   ```

2. **Configure Backend Environment**
   Create `InsightAgent-Backend/.env` based on `InsightAgent-Backend/.env.example`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"

   # AI Provider
   GROQ_API_KEY="your_groq_api_key_here"

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   REDIS_URL="redis://default:password@host:port"
   ALLOWED_ORIGINS=http://localhost:3000

   # Clerk Authentication
   CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"

   # Polar Payments
   POLAR_ACCESS_TOKEN="your_polar_token"
   POLAR_ORGANIZATION_ID="your_polar_org_id"
   POLAR_WEBHOOK_SECRET="your_polar_webhook_secret"
   POLAR_STARTER_PRODUCT_ID="your_product_id_starter"
   POLAR_GROWTH_PRODUCT_ID="your_product_id_growth"
   POLAR_POWER_PRODUCT_ID="your_product_id_power"
   ```

3. **Database Sync & Migration**
   Ensure database is migrated with current Prisma schemas:
   ```bash
   cd InsightAgent-Backend
   npx prisma migrate dev
   ```

4. **Configure Frontend Environment**
   Create `InsightAgent-Frontend/.env.local` matching `InsightAgent-Frontend/.env.example`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"

   # Clerk Redirections
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/
   ```

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd InsightAgent-Backend
npm run start:dev
```
Backend server is available at: `http://localhost:3001/api`

**Terminal 2 - Frontend:**
```bash
cd InsightAgent-Frontend
npm run dev
```
Frontend UI is available at: `http://localhost:3000`

---

## 📁 Project Structure

```
InsightAgent/
├── InsightAgent-Frontend/  # Next.js frontend
│   ├── src/
│   │   ├── app/            # App routes (admin, pricing, usage, projects, login, register)
│   │   ├── components/     # UI design system & layout components
│   │   ├── lib/            # Fetchers and API client utilities
│   │   └── types/          # TypeScript declarations
│   └── package.json
├── InsightAgent-Backend/   # NestJS backend
│   ├── src/
│   │   ├── auth/           # Clerk authentication & guards (JWT & Roles)
│   │   ├── users/          # Users management and admin analytics
│   │   ├── subscription/   # Polar payments & checkout fulfillment controller
│   │   ├── projects/       # Projects storage & access
│   │   ├── upload/         # CSV processing & table injection logic
│   │   ├── agent/          # LLM text-to-SQL logic & execution context
│   │   ├── health/         # System health check endpoints
│   │   └── prisma/         # Prisma provider service
│   ├── prisma/
│   │   └── schema.prisma   # PostgreSQL models (User, Project, TableMetadata, CreditTransaction)
│   └── package.json
├── sample_data/            # Mock dataset for testing purposes (customers.csv, orders.csv)
└── package.json            # Monorepo configuration
```

## 🔌 API Endpoints

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

---

## 🧪 Testing and Verification

Use the provided CSV datasets in `sample_data/`:
1. Create a project named "E-Commerce Test"
2. Upload `customers.csv` and `orders.csv`
3. Enter query: `"List email of customers who spent more than $1000 total"`
4. Verify the system:
   - Identifies columns `customers.id` and `orders.customer_id`.
   - Casts text fields to numeric/aggregate types automatically.
   - Generates the valid JOIN query and plots a correct visual chart.

## 📧 Support

For issues and questions, please open a GitHub issue.
