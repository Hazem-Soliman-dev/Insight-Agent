# InsightAgent Frontend

Next.js-based frontend for InsightAgent with modern UI and real-time data visualization.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🌍 Deployment

### Environment Variables
Configure these variables in your deployment platform:

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://api.your-domain.com`)

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

Or use Netlify UI:
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL`

### Deploy to Railway
1. Connect GitHub repository
2. Add environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy automatically on push

## 📝 Features

- 🔐 **Authentication UI** - Login, Register, and Session management
- 💳 **Pricing & Usage** - Dynamic subscription plans and premium usage dashboard
- 👑 **Admin Panel** - User management and subscription plan editor
- 🎨 Modern UI with OKLCH color system
- 📊 Real-time data visualization
- 🔄 Optimized data fetchers
- 📱 Responsive design
- ⚡ Performance optimized
- 🎯 Type-safe with TypeScript

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: CSS with OKLCH colors
- **State Management**: React hooks
- **HTTP Client**: Fetch API
- **TypeScript**: Full type safety

## 🔗 Connecting to Backend

Make sure to update `NEXT_PUBLIC_API_URL` in your `.env.local` file to point to your deployed backend:

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## 📦 Build Output

The production build creates an optimized bundle:
- Static pages are pre-rendered
- API routes are serverless functions
- Assets are optimized and cached
