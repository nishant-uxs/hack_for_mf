# CivicSense Render Deployment Guide

## 🚀 Quick Setup Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Click "New" → "Blueprint"
4. Select your CivicSense repository
5. Render will automatically detect `render.yaml` and set up everything

### 3. Set Environment Variables
In your Render dashboard, set these required environment variables:

**For civicsense-api service:**
- `CLIENT_URL` - Your frontend URL (Netlify/Vercel/Render)
- `ADMIN_EMAIL` - Admin email for bootstrap
- `GEMINI_API_KEY` - (Optional) For AI features

**Optional services:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - For email
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM`, `TWILIO_WHATSAPP_FROM` - For SMS

### 4. Deploy Frontend
Deploy your React app to Netlify, Vercel, or Render and set the URL in `CLIENT_URL`.

## 🔧 What I Fixed

### Database Issues Fixed:
1. **Added MongoDB Service**: Added a private MongoDB service using Docker
2. **Fixed Connection String**: Updated MONGODB_URI to use Render's internal service connection
3. **Added Retry Logic**: Server now retries database connection in production
4. **Fixed Root Directory**: Changed from `civicsense/server` to `server`

### Configuration Improvements:
1. **Health Check**: Added `/api/health` endpoint for Render monitoring
2. **Environment Variables**: Properly configured all required variables
3. **Auto-deployment**: Enabled automatic deployments on git push

## 📁 File Structure
```
CivicSense-main/
├── render.yaml              # ✅ Fixed configuration
├── server/
│   ├── server.js           # ✅ Added retry logic
│   ├── package.json
│   └── .env.example
└── client/                  # React frontend
```

## 🌐 Services Created

### 1. civicsense-mongodb (Private Service)
- Type: Docker Private Service
- Database: MongoDB with authentication
- Plan: Free

### 2. civicsense-api (Web Service)
- Type: Node.js Web Service
- Auto-connects to MongoDB
- Health checks enabled
- Plan: Free

## 🔍 Troubleshooting

### Database Connection Issues
If you see database connection errors:
1. Wait 2-3 minutes after deployment (MongoDB needs time to start)
2. Check logs in Render dashboard
3. Verify MongoDB service is running

### CORS Issues
Make sure `CLIENT_URL` is set correctly to your frontend domain.

### Build Failures
1. Check if all dependencies are in `server/package.json`
2. Verify `render.yaml` syntax is correct

## 📱 Testing Your Deployment

1. **API Health Check**: Visit `https://your-api.onrender.com/api/health`
2. **Database Connection**: Check logs for "✅ MongoDB connected"
3. **Frontend Connection**: Test registration/login from your frontend

## 💡 Pro Tips

1. **Use Custom Domains**: Add custom domains for professional appearance
2. **Monitor Logs**: Keep an eye on Render logs for any issues
3. **Environment Variables**: Never commit sensitive data to Git
4. **Database Backups**: Consider paid plan for automatic backups

## 🆘 Need Help?

If you face any issues:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set
3. Make sure MongoDB service starts before API service
4. Check this guide for common solutions

Your CivicSense app is now ready for production! 🎉
