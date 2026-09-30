# 🚀 Quick Deploy Setup

## Option 1: Render Backend + Vercel Frontend (Recommended)

### 1️⃣ Deploy Backend to Render

1. **Create Render Account**: [render.com](https://render.com)
2. **New Web Service** → Connect GitHub → Select `amrityadav11/Photo-Finder`
3. **Settings**:
   ```
   Name: qr-photo-finder-api
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://QRPHOTOFINDER:QRPHOTOFINDER@cluster0.eocvxb8.mongodb.net/qrphotofinder?retryWrites=true&w=majority
   JWT_SECRET=9be1a9f167c221983b371ef33d006056cb1e2b0d17d2310e6a24d66be5eadc6dc08fa667fbe0b3e0cf3ccf4e54c21b7bcb6b0ae56f547246fceed03e4a774677
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=dxinpjsrd
   CLOUDINARY_API_KEY=431351477165717
   CLOUDINARY_API_SECRET=qNyU9wjK-_0IDk4bFiwtJKCh_WE
   FACE_RECOGNITION_PROVIDER=local
   CLIENT_URL=https://your-vercel-url.vercel.app
   APP_DOMAIN=https://your-vercel-url.vercel.app
   ```
5. **Deploy** → Note your backend URL: `https://qr-photo-finder-api.onrender.com`

### 2️⃣ Deploy Frontend to Vercel

1. **Create Vercel Account**: [vercel.com](https://vercel.com)
2. **New Project** → Import `amrityadav11/Photo-Finder`
3. **Settings**:
   ```
   Framework: Create React App
   Root Directory: frontend
   ```
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://qr-photo-finder-api.onrender.com/api
   GENERATE_SOURCEMAP=false
   ```
5. **Deploy** → Note your frontend URL: `https://your-project.vercel.app`

### 3️⃣ Update Backend CORS

Go back to Render dashboard and update these environment variables:
```
CLIENT_URL=https://your-actual-vercel-url.vercel.app
APP_DOMAIN=https://your-actual-vercel-url.vercel.app
```

**Redeploy** the backend service.

---

## Option 2: Full Vercel (Frontend + Serverless Backend)

### 1️⃣ Deploy to Vercel

1. **New Project** → Import `amrityadav11/Photo-Finder`
2. **Root Directory**: `./` (project root)
3. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://QRPHOTOFINDER:QRPHOTOFINDER@cluster0.eocvxb8.mongodb.net/qrphotofinder?retryWrites=true&w=majority
   JWT_SECRET=9be1a9f167c221983b371ef33d006056cb1e2b0d17d2310e6a24d66be5eadc6dc08fa667fbe0b3e0cf3ccf4e54c21b7bcb6b0ae56f547246fceed03e4a774677
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=dxinpjsrd
   CLOUDINARY_API_KEY=431351477165717
   CLOUDINARY_API_SECRET=qNyU9wjK-_0IDk4bFiwtJKCh_WE
   FACE_RECOGNITION_PROVIDER=local
   NODE_ENV=production
   ```
4. **Deploy**

---

## 🧪 Test Your Deployment

### Health Checks
- Backend: `https://your-backend-url/api/health`
- Frontend: Open your frontend URL
- Registration: Create test account
- Event creation: Test full flow

### Common Issues
- **CORS**: Update `CLIENT_URL` with correct frontend URL
- **500 Errors**: Check logs in dashboard, verify environment variables
- **Build Fails**: Check Node.js version, dependencies

---

## 🎯 URLs Template

After deployment, you'll have:

**Backend API**: `https://qr-photo-finder-api.onrender.com`  
**Frontend**: `https://qr-photo-finder-xxx.vercel.app`  
**Health Check**: `https://qr-photo-finder-api.onrender.com/api/health`

Replace `xxx` with your actual Vercel project identifier.