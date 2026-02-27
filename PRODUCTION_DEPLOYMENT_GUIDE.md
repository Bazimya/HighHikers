# 🚀 PRODUCTION DEPLOYMENT GUIDE - HighHikers

**Status:** Ready for Implementation | **Last Updated:** February 12, 2026

---

## PHASE 1: Pre-Deployment Preparation (Local)

### Step 1.1: Apply All Fixes

```bash
# 1. Ensure all critical fixes are applied
# - ✅ CORS Configuration (DONE)
# - ✅ Session Persistence (DONE) 
# - ✅ Environment Validation (DONE)
# - ✅ Vite Build Config (DONE)
# ⚠️  TypeScript Errors (See TYPESCRIPT_FIXES_DETAILED.md)

# 2. Fix remaining TypeScript errors
npm run check

# If errors remain - refer to TYPESCRIPT_FIXES_DETAILED.md for specific fixes

# 3. Install all dependencies
npm install

# 4. Test build locally
npm run build

# Should complete without errors
```

### Step 1.2: Local Testing

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Test in browser
# Visit: http://localhost:5173

# Test Checklist:
# - [ ] Home page loads
# - [ ] Trails page loads and shows data
# - [ ] Events page loads
# - [ ] Blog page loads
# - [ ] Register new user
# - [ ] Login with user
# - [ ] Create admin content (trails, events, blog)
# - [ ] Payment flow (test with Stripe test card 4242 4242 4242 4242)
# - [ ] Newsletter subscription
# - [ ] Contact form submission
# - [ ] User profile update
# - [ ] Logout
```

### Step 1.3: Verify Production Build

```bash
# Build for production
npm run build

# Should create dist/public with:
# - index.html (with client assets)
# - dist/index.js (server)

# Verify structure:
ls -la dist/
ls -la dist/public/

# Test production build locally:
npm start
# Visit: http://localhost:3000 (or whatever PORT is set)
```

---

## PHASE 2: Server Setup

### Step 2.1: Choose Hosting Platform

**Recommended Options:**
1. **DigitalOcean App Platform** (Easiest)
   - MongoDB Atlas for database
   - Built-in SSL
   - $12/month minimum

2. **Heroku** (Simplest but pricier)
   - MongoDB Atlas for database
   - Deploy via Git

3. **AWS EC2** (Most control)
   - EC2 t3.micro (free tier eligible)
   - Amazon DocumentDB or Atlas for MongoDB
   - RDS for backups

4. **Render.com** (Modern alternative)
   - Simple deployment
   - MongoDB Atlas
   - Free tier available

### Step 2.2: Set Up MongoDB Database

**Option A: MongoDB Atlas (Recommended)**

1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user with strong password
5. Get connection string: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/high-hikers`

**Option B: Self-hosted (Advanced)**
- Skip for production unless experienced with DevOps

### Step 2.3: Prepare Environment Variables

Create production `.env` file with:

```bash
# REQUIRED - Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# REQUIRED - Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/high-hikers

# REQUIRED - Session
SESSION_SECRET=$(openssl rand -base64 32)  # Generate random
SESSION_CRYPTO_SECRET=$(openssl rand -base64 32)

# REQUIRED - Stripe (Replace with production keys)
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook

# REQUIRED - Email (Use SendGrid for production)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@yourdomain.com

# OPTIONAL
LOG_LEVEL=error
VITE_BASE_PATH=/
```

**Generate Secure Secrets:**
```bash
# On Mac/Linux:
openssl rand -base64 32  # for SESSION_SECRET
openssl rand -base64 32  # for SESSION_CRYPTO_SECRET

# Alternative using node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## PHASE 3: Server Deployment

### Step 3.1: Deploy to DigitalOcean App Platform (Recommended)

1. Push code to GitHub (if not already):
```bash
git init
git add .
git commit -m "Production ready"
git push origin main
```

2. Go to DigitalOcean.com
3. Create App Platform > Connect GitHub Repository
4. Select this repository
5. Choose region closest to your users
6. Add environment variables (paste from above)
7. Add MongoDB database connection
8. Set build command: `npm run build`
9. Set run command: `npm start`
10. Deploy

### Step 3.2: Deploy to Render.com (Free Alternative)

1. Push to GitHub
2. Connect GitHub to Render
3. Create Web Service
4. Select this repository
5. Environment: Node
6. Build command: `npm run build`
7. Start command: `npm start`
8. Add environment variables
9. Deploy

### Step 3.3: Deploy to Heroku (Traditional)

```bash
# Install Heroku CLI
# Windows: https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew install heroku/brew/heroku

# Login to Heroku
heroku login

# Create app
heroku create highhikers-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
# Set all other variables...

# Deploy
git push heroku main

# View logs
heroku logs -t
```

---

## PHASE 4: Post-Deployment Configuration

### Step 4.1: Set Up Stripe Webhooks

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
4. Copy signing secret
5. Add to environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Step 4.2: Configure Email Service

**For SendGrid:**
1. Create SendGrid account (sendgrid.com)
2. Get API key
3. Set in environment: `SENDGRID_API_KEY=SG....`
4. Update EMAIL_FROM and EMAIL_SERVICE

**For Gmail:**
1. Enable 2FA on Gmail account
2. Generate App Password (not regular password)
3. Set EMAIL_USER and EMAIL_PASSWORD

### Step 4.3: Set Up SSL Certificate

**If using DigitalOcean/Render:**
- Automatic SSL provided ✅

**If self-hosting:**
```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com
# Point to /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### Step 4.4: Configure Custom Domain

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Point nameservers to hosting provider
3. Or update DNS records to point to server IP
4. Update FRONTEND_URL environment variable

---

## PHASE 5: Testing on Production

### Step 5.1: Smoke Tests

```bash
# Test API
curl https://yourdomain.com/api/trails
curl https://yourdomain.com/api/events

# Test website loads
curl https://yourdomain.com
```

### Step 5.2: User Flow Testing

Using Production URL (https://yourdomain.com):

- [ ] Register new user
- [ ] Login
- [ ] Browse trails
- [ ] Browse events
- [ ] Read blog posts
- [ ] Register for event
- [ ] Submit payment (use test card if enabled)
- [ ] Update profile
- [ ] Subscribe to newsletter
- [ ] Submit contact form
- [ ] Logout

### Step 5.3: Performance Testing

```bash
# Check page load time
curl -w "Time: %{time_total}s\n" https://yourdomain.com

# Monitor server logs
# DigitalOcean: Dashboard > Logs
# Heroku: heroku logs -t
# Render: Dashboard > Logs
```

---

## PHASE 6: Monitoring & Maintenance

### Step 6.1: Set Up Error Tracking

Choose one:

**Option A: Sentry (Recommended)**
```bash
npm install @sentry/react @sentry/tracing
npm install @sentry/node

# In client/src/main.tsx:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({ maskAllText: true, blockAllMedia: true })
  ],
});
```

**Option B: LogRocket**
```bash
npm install logrocket
```

### Step 6.2: Set Up Alerts

**Email Alerts for Errors:**
- Configure at Sentry/LogRocket
- Add your email

**Database Backups:**
- MongoDB Atlas: Automatic backups included
- Set backup frequency

### Step 6.3: Monitor Server Health

**Daily:**
- [ ] Check error logs
- [ ] Verify API responses
- [ ] Check database connection

**Weekly:**
- [ ] Review performance metrics
- [ ] Check disk space
- [ ] Verify backups are working

**Monthly:**
- [ ] Update dependencies
- [ ] Review security vulnerabilities
- [ ] Check SSL certificate expiration

---

## PHASE 7: Security Hardening

### Step 7.1: Enable HTTPS Only

```typescript
// server/index.ts
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Step 7.2: Rate Limiting Check

Verify rate limiting is enabled:
```bash
# Try more than 5 login attempts rapidly
# Should see: "Too many login attempts"
```

### Step 7.3: Security Headers Check

```bash
curl -I https://yourdomain.com
# Should see headers:
# Strict-Transport-Security
# X-Content-Type-Options
# X-Frame-Options
# Content-Security-Policy
```

### Step 7.4: Database Security

- ✅ MongoDB Atlas: Enable IP whitelist
- ✅ Set strong password (20+ chars, mixed case, numbers, symbols)
- ✅ Remove user if not needed
- ✅ Enable SSL connection requirement

---

## TROUBLESHOOTING

### Issue: "Cannot GET /"

**Solution:** Make sure build completed and dist/public exists

```bash
npm run build  # Rebuild
npm start      # Start server
```

### Issue: "Cannot connect to MongoDB"

**Solution:** Check MONGODB_URI environment variable

```bash
echo $MONGODB_URI  # Verify it's set
# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!'))"
```

### Issue: "CORS errors in console"

**Solution:** Update FRONTEND_URL in environment

```bash
# Should match your domain
FRONTEND_URL=https://yourdomain.com
```

### Issue: "Session not persisting"

**Solution:** Verify MongoDB is connected and mongo-connect is working

```bash
# Check MongoDB connection in logs
# Should see: "connected successfully"
```

### Issue: "Stripe payments failing"

**Solution:** Verify webhook secret is correct

```bash
# Test webhook:
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Stripe-Signature: test_sig" \
  -d '{"type":"payment_intent.succeeded"}'
```

---

## Scaling Checklist (If Usage Increases)

- [ ] Database: Upgrade MongoDB tier
- [ ] Server: Increase server resources
- [ ] CDN: Add CloudFront / Cloudflare
- [ ] Cache: Add Redis for session/data caching
- [ ] Images: Upload to S3/Cloud Storage
- [ ] Email: Upgrade SendGrid plan

---

## Maintenance Schedule

**Daily (Automated):**
- Database backup
- Error tracking

**Weekly:**
- Review error logs
- Check performance metrics
- Update dependencies (patch versions)

**Monthly:**
- Security audit
- Update minor/major versions (if stable)
- Review costs

**Quarterly:**
- Full security review
- Performance optimization
- Feature updates

---

## Rollback Plan

If deployment has issues:

```bash
# Revert to previous version in git
git revert <commit-hash>
git push <platform>

# Or manually redeploy previous version
git checkout main
npm run build
npm start
```

**Keep backups of:**
- `.env` files (encrypted)
- Database exports (weekly)
- Code (in Git)

---

## Success Criteria

You're production-ready when:

✅ All TypeScript errors fixed  
✅ `npm run check` passes  
✅ `npm run build` succeeds  
✅ Local testing passes all checklist items  
✅ Server is deployed  
✅ SSL certificate is active  
✅ Database is connected  
✅ Email service is working  
✅ Stripe is configured  
✅ Error tracking is enabled  
✅ Production URLs work  
✅ User flows work end-to-end  

---

## Support & Resources

- **Mongoose Docs:** mongoosejs.com
- **Express Docs:** expressjs.com
- **React Query:** tanstack.com/query
- **Stripe Docs:** stripe.com/docs
- **MongoDB Atlas:** mongodb.com/cloud/atlas
- **Render Docs:** render.com/docs

---

**Remember:** Always test thoroughly before deploying! 🚀

