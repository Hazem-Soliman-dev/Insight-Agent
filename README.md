# InsightAgent - Agentic Business Intelligence System

An AI-powered data analysis platform that transforms CSV files into queryable databases and answers natural language questions using advanced AI.

## 🚀 Features

- **Multi-File CSV Upload**: Drag-and-drop multiple CSV files
- **Dynamic Table Creation**: Automatic conversion to PostgreSQL tables
- **AI-Powered Queries**: Ask questions in plain English
- **Smart JOIN Detection**: AI automatically detects table relationships
- **Auto-Visualization**: Results displayed as tables or charts (bar, pie, line)
- **Real-time Processing**: Animated thinking UI shows AI analysis steps

## 🛠️ Tech Stack

### Backend
- **NestJS** - Enterprise Node.js framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Database (Neon cloud)
- **Groq SDK** - AI integration (Llama 3.3-70b)

### Frontend
- **Next.js 14** - React framework with App Router
- **Shadcn/UI** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **React Dropzone** - File upload

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- Groq API key

### Setup

1. **Clone and install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

2. **Configure Backend Environment**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL="your_postgresql_connection_string"
GROQ_API_KEY="your_groq_api_key"
PORT=3001
```

3. **Run Prisma Migrations**
```bash
cd server
npx prisma migrate dev
```

4. **Configure Frontend Environment**
```bash
cd client
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```
Backend runs at: http://localhost:3001/api

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs at: http://localhost:3000

### Production Build

```bash
# Build backend
cd server
npm run build
npm run start:prod

# Build frontend
cd client
npm run build
npm start
```

## 📖 Usage Guide

### 1. Create a Project
- Open http://localhost:3000
- Click "New Project"
- Enter a project name

### 2. Upload CSV Files
- Drag and drop CSV files into the upload zone
- Files are automatically converted to SQL tables
- View uploaded files in the sidebar

### 3. Ask Questions
Try these example queries:
- "Show all records from customers"
- "What is the total revenue?"
- "List customers who spent more than $500"
- "Show email addresses of top 5 customers by order amount"

### 4. View Results
- **Table View**: Browse raw query results
- **Chart View**: Auto-generated visualizations
- **SQL View**: See the generated SQL query

## 📁 Project Structure

```
InsightAgent/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages and layouts
│   │   ├── components/    # React components
│   │   ├── lib/           # API client
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                # NestJS backend
│   ├── src/
│   │   ├── projects/      # Project management
│   │   ├── upload/        # CSV processing
│   │   ├── agent/         # AI query engine
│   │   └── prisma/        # Database service
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── sample_data/           # Test CSV files
│   ├── customers.csv
│   └── orders.csv
└── package.json           # Monorepo root
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project details |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/upload` | Upload CSV file |
| DELETE | `/api/upload/:projectId/:tableName` | Delete table |
| POST | `/api/agent/query` | Execute AI query |
| GET | `/api/agent/preview/:projectId/:tableName` | Preview table data |

## 🧪 Testing

Sample CSV files are provided in `sample_data/`:
- `customers.csv` - Customer information
- `orders.csv` - Order data with customer references

Upload both files and try:
> "List the email of customers who spent more than $1000 total"

The AI will:
1. Analyze both table schemas
2. Detect the relationship between `customers.id` and `orders.customer_id`
3. Generate a JOIN query with SUM aggregation
4. Execute and return results

## 🎨 Key Features Explained

### Dynamic Table Creation
- CSV files are parsed and converted to PostgreSQL tables
- Table names use project-scoped prefixes: `proj_{id}_{filename}`
- All columns stored as TEXT for maximum flexibility
- Metadata tracked for schema introspection

### AI Query Engine
- Uses Groq SDK with Llama 3.3-70b model
- Automatically infers table relationships by column names
- Generates SQL with proper type casting
- Safety checks prevent destructive queries

### Smart Visualizations
- Analyzes query results to suggest chart types
- Bar charts for categorical aggregations
- Pie charts for small datasets with percentages
- Line charts for time-series data
- Falls back to table view for complex results

## 🔒 Security

- Only SELECT queries allowed (no DELETE, DROP, etc.)
- Project-scoped table isolation
- Input validation on all endpoints
- CORS configured for frontend origin

# 📊 InsightAgent Backend

AI-powered NestJS API that transforms CSV files into queryable databases with natural language processing.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

- 🤖 **AI-Powered Queries** - Natural language to SQL using Groq/Llama
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
| POST | `/api/agent/query` | AI query |

## 🛠️ Tech Stack

- **NestJS** - Framework
- **PostgreSQL** - Database (Prisma ORM)
- **Groq AI** - Llama 3.3-70b
- **Redis** - Caching
- **TypeScript** - Language

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🐛 Troubleshooting

**Frontend won't start:**
- Ensure `.env.local` exists with `NEXT_PUBLIC_API_URL`
- Run `npm install` in the client directory

**Backend won't start:**
- Check DATABASE_URL in `server/.env`
- Run `npx prisma migrate dev` to sync database
- Verify GROQ_API_KEY is valid

**AI queries failing:**
- Check Groq API key is correct
- Ensure you have uploaded CSV files
- Try simpler queries first

## 📧 Support

For issues and questions, please open a GitHub issue.
