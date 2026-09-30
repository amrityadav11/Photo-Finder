# 🚀 Deployment Guide

This guide covers deploying the QR Photo Finder application to both Vercel and Render.

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub repository pushed (✅ Done: `https://github.com/amrityadav11/Photo-Finder.git`)
- MongoDB Atlas database
- Cloudinary account
- Vercel account (for frontend)
- Render account (for backend)

---

## 🎯 Deployment Strategy

**Frontend (React)** → **Vercel** (Free tier, excellent React support)  
**Backend (Node.js API)** → **Render** (Free tier, good for Node.js apps)

---

## 🌐 Option 1: Vercel Frontend + Render Backend

### Step 1: Deploy Backend to Render

#### 1.1 Create Render Web Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: `amrityadav11/Photo-Finder`
5. Configure the service:
   - **Name**: `qr-photo-finder-api` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 1.2 Set Environment Variables in Render

In Render dashboard, go to **Environment** tab and add:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://QRPHOTOFINDER:QRPHOTOFINDER@cluster0.eocvxb8.mongodb.net/qrphotofinder?retryWrites=true&w=majority
JWT_SECRET=9be1a9f167c221983b371ef33d006056cb1e2b0d17d2310e6a24d66be5eadc6dc08fa667fbe0b3e0cf3ccf4e54c21b7bcb6b0ae56f547246fceed03e4a774677
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=dxinpjsrd
CLOUDINARY_API_KEY=431351477165717
CLOUDINARY_API_SECRET=qNyU9wjK-_0IDk4bFiwtJKCh_WE
FACE_RECOGNITION_PROVIDER=local
CLIENT_URL=https://your-frontend-url.vercel.app
APP_DOMAIN=https://your-frontend-url.vercel.app
MAX_FILE_SIZE_MB=20
MAX_FILES_PER_UPLOAD=100
FACE_SIMILARITY_THRESHOLD=0.80
```

**⚠️ Important Notes:**
- Replace `CLIENT_URL` and `APP_DOMAIN` with your actual Vercel frontend URL (you'll get this in Step 2)
- Keep `PORT=10000` (Render's default)
- Use your own MongoDB URI, Cloudinary credentials, and JWT secret

#### 1.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build and deployment (5-10 minutes)
3. Your backend will be available at: `https://qr-photo-finder-api.onrender.com`
4. Test health endpoint: `https://your-backend-url.onrender.com/api/health`

---

### Step 2: Deploy Frontend to Vercel

#### 2.1 Create Frontend Environment File

First, create the production environment file:

```bash
# In your local project
echo "REACT_APP_API_URL=https://your-backend-url.onrender.com/api" > frontend/.env.production
```

Replace `your-backend-url` with your actual Render backend URL.

#### 2.2 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"New Project"**
3. Import from GitHub: `amrityadav11/Photo-Finder`
4. Configure project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

#### 2.3 Set Environment Variables in Vercel

In Vercel dashboard, go to **Settings** → **Environment Variables**:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://your-backend-url.onrender.com/api` |
| `GENERATE_SOURCEMAP` | `false` |

#### 2.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. Your frontend will be available at: `https://your-project.vercel.app`

#### 2.5 Update Backend CORS Settings

Now update your Render backend environment variables:
- `CLIENT_URL` → `https://your-project.vercel.app`
- `APP_DOMAIN` → `https://your-project.vercel.app`

Redeploy the backend service in Render dashboard.

---

## 🔧 Option 2: Full Vercel Deployment (Frontend + Serverless API)

### Step 1: Create Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend/src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/app.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/$1"
    }
  ],
  "functions": {
    "backend/src/app.js": {
      "maxDuration": 30
    }
  }
}
```

### Step 2: Create API Entry Point

Create `api/index.js`:

```javascript
// Vercel serverless function entry point
const app = require('../backend/src/app');
module.exports = app;
```

### Step 3: Update Frontend Build

Update root `package.json`:

```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "vercel-build": "npm run build"
  }
}
```

### Step 4: Deploy to Vercel

1. Import GitHub repository to Vercel
2. Set **Root Directory**: `./` (project root)
3. Set environment variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your-jwt-secret` |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | `your-api-key` |
| `CLOUDINARY_API_SECRET` | `your-api-secret` |
| `FACE_RECOGNITION_PROVIDER` | `local` |
| `NODE_ENV` | `production` |

4. Deploy

---

## 📋 Post-Deployment Checklist

### ✅ Test Functionality

1. **Backend Health**: Visit `https://your-backend-url/api/health`
2. **Frontend Loading**: Visit your frontend URL
3. **User Registration**: Create a test account
4. **Event Creation**: Create a test event
5. **QR Code Generation**: Verify QR codes work
6. **Photo Upload**: Test photo upload (small files first)
7. **Guest Flow**: Test the guest selfie → photo matching flow

### ✅ Security Checks

1. **Environment Variables**: Ensure no secrets are in public code
2. **CORS**: Verify frontend can call backend APIs
3. **HTTPS**: Ensure both frontend and backend use HTTPS
4. **Database**: Check MongoDB connection and data persistence

### ✅ Performance Optimization

1. **Cloudinary**: Images are optimized and served via CDN
2. **Build Size**: Frontend build is optimized
3. **API Response Times**: Test API endpoints under load

---

## 🔧 Troubleshooting

### Common Issues

**❌ CORS Error**
- Fix: Update `CLIENT_URL` in backend environment variables
- Ensure both frontend and backend URLs use HTTPS

**❌ 500 Server Error**
- Check backend logs in Render/Vercel dashboard
- Verify all environment variables are set correctly
- Test MongoDB connection

**❌ Build Failed**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check for syntax errors in code

**❌ Images Not Loading**
- Verify Cloudinary credentials
- Check upload file size limits
- Ensure proper CORS headers for images

### Useful Commands

```bash
# Test backend locally
cd backend && npm run dev

# Test frontend locally
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build

# Check backend health
curl https://your-backend-url.onrender.com/api/health
```

---

## 💰 Cost Considerations

### Free Tier Limits

**Vercel Free:**
- 100GB bandwidth/month
- Unlimited static sites
- 100 serverless function executions/day
- 10 second timeout

**Render Free:**
- 750 hours/month compute time
- Sleeps after 15 minutes of inactivity
- 500MB RAM
- Shared CPU

### Recommended Upgrade Path

1. **Start**: Vercel Free + Render Free
2. **Growth**: Vercel Pro ($20/month) + Render Starter ($7/month)
3. **Scale**: Vercel Pro + Render Professional ($25/month)

---

## 🌟 Production Tips

1. **Custom Domain**: Add your own domain in Vercel/Render settings
2. **Analytics**: Add Vercel Analytics for usage insights
3. **Monitoring**: Set up uptime monitoring (Render has built-in monitoring)
4. **Backups**: Regular MongoDB Atlas backups
5. **CDN**: Cloudinary automatically provides global CDN
6. **Error Tracking**: Consider adding Sentry for error monitoring

---

**Need help?** Check the logs in your deployment dashboards or test locally first to isolate issues.