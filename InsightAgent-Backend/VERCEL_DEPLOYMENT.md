# Vercel Deployment Guide for InsightAgent Backend

## 📋 Vercel Settings

When deploying to Vercel, use these settings:

### Build & Development Settings:

**Framework Preset:**
```
Other
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

**Root Directory:**
```
./
```

---

## 🔐 Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
GROQ_API_KEY=gsk_your_groq_api_key_here
REDIS_URL=redis://default:password@host:port
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
NODE_ENV=production
PORT=3001
```

### How to Add:
1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each variable above
4. Select **Production**, **Preview**, and **Development** for each
5. Click **Save**

---

## 📝 Important Notes

### 1. Database Connection
- Make sure your PostgreSQL database (Neon) allows connections from Vercel
- Use connection pooling for better performance
- Example: `?sslmode=require&pgbouncer=true`

### 2. Redis Connection
- Ensure your Redis instance is accessible from Vercel
- Use Redis Labs or Upstash for serverless Redis

### 3. CORS Configuration
- Add your Vercel frontend URL to `ALLOWED_ORIGINS`
- Example: `https://your-app.vercel.app,https://your-app-preview.vercel.app`

### 4. Cold Starts
- Vercel serverless functions may have cold starts
- First request might be slower (~2-3 seconds)
- Subsequent requests will be fast

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure settings as shown above
5. Add environment variables
6. Click **Deploy**

### Option 2: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd d:\courses\Projects\InsightAgent\server
vercel --prod
```

---

## ✅ After Deployment

1. **Test your API:**
   ```bash
   curl https://your-backend.vercel.app/api
   ```

2. **Update Frontend:**
   - Update `NEXT_PUBLIC_API_URL` in your frontend to point to your Vercel backend URL
   - Example: `https://your-backend.vercel.app`

3. **Monitor Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on a deployment to see logs

---

## 🐛 Troubleshooting

### Build Fails?
- Check that `package.json` has `"build": "nest build"`
- Ensure all dependencies are in `dependencies`, not `devDependencies`

### Database Connection Fails?
- Verify `DATABASE_URL` is correct
- Check that Neon allows Vercel IPs
- Try adding `?connect_timeout=10`

### CORS Errors?
- Add your frontend URL to `ALLOWED_ORIGINS`
- Include both production and preview URLs

### Function Timeout?
- Vercel has a 10-second timeout on Hobby plan
- Optimize slow queries
- Consider upgrading to Pro plan for 60-second timeout

---

## 💡 Alternative: Railway (Recommended for NestJS)

If you face issues with Vercel, Railway is better suited for NestJS backends:

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

Railway advantages:
- ✅ No cold starts
- ✅ Always-on server
- ✅ Better for WebSockets
- ✅ Longer execution time
- ✅ Built-in PostgreSQL

---

**🎉 Your backend should now be deployed on Vercel!**
