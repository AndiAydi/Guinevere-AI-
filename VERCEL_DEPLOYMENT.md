# Guinevere AI - Vercel Frontend Deployment Guide

Panduan lengkap untuk deploy frontend Guinevere AI ke Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account dengan Guinevere AI repository
- Backend URL (dari Railway/Render deployment)

## Step 1: Push Code ke GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Guinevere AI - Initial commit"
git branch -M main

# Add remote
git remote add origin https://github.com/your-username/guinevere-ai.git

# Push to GitHub
git push -u origin main
```

## Step 2: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Search for `guinevere-ai` repository
5. Click "Import"

## Step 3: Configure Project Settings

### Build Settings

**Framework Preset:** Vite

**Build Command:**
```bash
cd client && pnpm install && pnpm build
```

**Output Directory:**
```
client/dist
```

**Install Command:**
```bash
pnpm install
```

### Environment Variables

Add di Vercel project settings:

```
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id
VITE_APP_TITLE=Guinevere Personal AI
VITE_APP_LOGO=https://your-logo-url.png
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
VITE_API_URL=https://your-backend-url.railway.app
```

**PENTING:** Replace `your-backend-url` dengan actual backend URL dari Railway/Render!

## Step 4: Deploy

Click "Deploy" button. Vercel akan:
1. Clone repository
2. Install dependencies
3. Build frontend
4. Deploy ke Vercel CDN

Deployment selesai dalam 2-5 menit.

## Step 5: Get Frontend URL

Vercel akan provide URL seperti:
```
https://guinevere-ai.vercel.app
```

Gunakan URL ini untuk akses frontend.

## Step 6: Configure Custom Domain (Optional)

1. Di Vercel project settings → "Domains"
2. Click "Add Domain"
3. Enter domain kamu (e.g., `guin.ai`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (24 hours)

## Step 7: Test Frontend

1. Visit frontend URL
2. Check console untuk errors
3. Verify API calls ke backend

### Test API Connection

Open browser console dan run:
```javascript
fetch('/api/trpc/auth.me?input={}')
  .then(r => r.json())
  .then(console.log)
```

Should return user data atau null jika not authenticated.

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_FRONTEND_FORGE_API_URL` | Manus API endpoint | https://api.manus.im |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus API key | your_key_here |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal | https://portal.manus.im |
| `VITE_APP_ID` | OAuth app ID | your_app_id |
| `VITE_APP_TITLE` | App title | Guinevere AI |
| `VITE_APP_LOGO` | App logo URL | https://cdn.../logo.png |
| `VITE_API_URL` | Backend API URL | https://your-backend.railway.app |

## Troubleshooting

### Build Fails

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
git add .
git commit -m "Fix dependencies"
git push
```

### API Calls Fail

**Error:** `Failed to fetch from /api/...`

**Solution:**
1. Check `VITE_API_URL` di Vercel settings
2. Verify backend is running
3. Check CORS configuration di backend
4. View browser console untuk error details

### Blank Page

**Error:** Page loads tapi tidak ada content

**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab untuk errors
3. Check Network tab untuk failed requests
4. Verify environment variables

### Slow Performance

**Solution:**
1. Enable Vercel Analytics
2. Check build size: `pnpm build`
3. Optimize images
4. Setup CDN untuk assets

## Continuous Deployment

Vercel auto-deploy setiap kali push ke main branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel akan auto-deploy dalam 1-2 menit
```

Disable auto-deploy di project settings jika tidak diinginkan.

## Rollback to Previous Deployment

1. Di Vercel project → "Deployments"
2. Find previous deployment yang stable
3. Click "Promote to Production"

## Monitor Deployments

1. Di Vercel project → "Deployments"
2. View build logs
3. Check deployment status
4. View analytics

## Performance Optimization

### 1. Enable Caching

Di `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Compress Assets

Vite sudah auto-compress. Verify di build output.

### 3. Monitor Bundle Size

```bash
pnpm build
# Check dist/ folder size
```

## Security

### 1. Never Commit Secrets

Add ke `.gitignore`:
```
.env.local
.env.*.local
```

### 2. Use Vercel Secrets

Sensitive values set di Vercel dashboard, not in code.

### 3. Enable HTTPS

Vercel auto-enable HTTPS. Verify di browser.

### 4. Setup Rate Limiting

Backend sudah punya rate limiting middleware.

## Monitoring & Logging

### Vercel Analytics

1. Enable di project settings
2. View real-time metrics
3. Monitor performance

### Browser Console Logs

Check untuk errors saat development:
```javascript
console.log('Debug info');
console.error('Error occurred');
```

### Backend Logs

View di Railway/Render dashboard untuk API errors.

## Redeploy Frontend

Jika perlu redeploy tanpa code changes:

1. Di Vercel project → "Deployments"
2. Find latest deployment
3. Click "..." → "Redeploy"

## Next Steps

1. ✅ Deploy frontend ke Vercel
2. ✅ Deploy backend ke Railway/Render
3. ✅ Connect frontend to backend
4. ✅ Test API connectivity
5. ✅ Setup custom domain
6. ✅ Monitor performance
7. ✅ Setup backups

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- tRPC Docs: https://trpc.io

---

**Last Updated:** April 2026
**Version:** 2.1
