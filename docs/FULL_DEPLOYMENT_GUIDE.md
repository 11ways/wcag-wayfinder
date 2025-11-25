# WCAG Wayfinder - Full Stack Deployment Guide

Complete guide for deploying the entire WCAG Wayfinder application (frontend + API + database) to your server.

## Overview

The application has 3 components:

1. **Frontend** (React SPA) → Deployed to `/home/roel/websites/wcag.be/public`
2. **API Backend** (Bun server) → Deployed to `/home/roel/websites/wcag.be/api`
3. **Database** (SQLite) → Deployed to `/home/roel/websites/wcag.be/data`

**Admin Interface**: Stays on your local machine only (not deployed for security)

## Architecture

```
┌─────────────────────────────────────────┐
│  User's Browser                         │
│  https://www.wcag.be/                   │
└─────────────┬───────────────────────────┘
              │
              │ HTTPS (443)
              ▼
┌─────────────────────────────────────────┐
│  Nginx (Web Server)                     │
│  - Serves static files (frontend)      │
│  - Proxies /api → localhost:8787        │
└─────────────┬───────────────────────────┘
              │
              │ /api requests
              ▼
┌─────────────────────────────────────────┐
│  PM2 Process Manager                    │
│  ┌─────────────────────────────────┐   │
│  │ Bun API Server (port 8787)      │   │
│  │ - Reads wcag.sqlite             │   │
│  │ - Returns JSON data             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Prerequisites

✅ All automatically installed by the deployment script:
- **Bun** - Modern JavaScript runtime (like Node.js but faster)
- **PM2** - Process manager to keep API running

## Quick Start

From the project root directory:

```bash
# Navigate to project root
cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer

# Run the full deployment script
./deploy-full.sh
```

That's it! The script handles everything automatically.

## What the Deployment Script Does

### Automatic Steps

1. ✅ **Pre-flight checks** - Verifies SSH connection
2. ✅ **Installs Bun** - If not already installed on server
3. ✅ **Installs PM2** - If not already installed on server
4. ✅ **Builds frontend** - Runs `npm run build` for the React app
5. ✅ **Creates backups** - Backs up existing deployment
6. ✅ **Deploys database** - Uploads `wcag.sqlite` to server
7. ✅ **Deploys backend** - Uploads API code and installs dependencies
8. ✅ **Deploys frontend** - Uploads built static files
9. ✅ **Starts API** - Launches API with PM2 (auto-restart enabled)

### Deployment Locations

```
/home/roel/websites/wcag.be/
├── public/          # Frontend (static files)
│   ├── index.html
│   ├── assets/
│   └── content/
├── api/             # Backend (API source code)
│   ├── apps/api/
│   ├── packages/db/
│   ├── package.json
│   └── ecosystem.json (PM2 config)
├── data/            # Database
│   └── wcag.sqlite
├── logs/            # Application logs
│   ├── api-out.log
│   └── api-error.log
└── backups/         # Automatic backups
    ├── wcag-full-backup-20251114_120000-frontend.tar.gz
    ├── wcag-full-backup-20251114_120000-backend.tar.gz
    └── wcag-full-backup-20251114_120000-data.tar.gz
```

## Database Workflow

### Development → Production

Your workflow for updating WCAG data:

1. **Edit data locally** using the admin interface (http://localhost:5174/admin)
2. **Test changes** locally with your dev server
3. **Run deployment** - `./deploy-full.sh`
4. **Database is uploaded** - The entire `wcag.sqlite` file is uploaded to the server

This works perfectly because:
- ✅ WCAG data is **read-only** on the production server
- ✅ All edits happen locally in your admin interface
- ✅ Simple and safe - no database migrations needed
- ✅ Fast - SQLite database is small (~few MB)

### Important Notes

- 🔒 **Admin interface never gets deployed** - It stays on your local machine
- 📊 **Production database is read-only** - API only performs SELECT queries
- 🔄 **Each deployment replaces the entire database** - Simple and predictable
- 💾 **Automatic backups** - Old database is backed up before replacement

## Environment Variables

The API uses these environment variables (configured in PM2):

```json
{
  "PORT": "8787",                    // API listens on port 8787
  "NODE_ENV": "production",          // Production mode
  "ALLOWED_ORIGINS": "https://www.wcag.be,https://wcag.be",  // CORS
  "ADMIN_PASSWORD": "changeme"       // Admin routes (not deployed anyway)
}
```

To change these after deployment:

```bash
ssh roel@merlina.develry.be
cd /home/roel/websites/wcag.be/api
nano ecosystem.json
pm2 restart wcag-api
```

## Post-Deployment: Nginx Configuration

After first deployment, you need to configure Nginx **once**:

### Check Current Nginx Config

```bash
ssh roel@merlina.develry.be
cat /etc/nginx/sites-available/wcag.be
```

### Key Requirements

Your Nginx config must:

1. **Serve frontend** from `/home/roel/websites/wcag.be/public`
2. **Proxy /api** requests to `http://localhost:8787`
3. **SPA routing** - All routes go to `index.html`

See `NGINX_CONFIG.md` for complete configuration examples.

### Quick Test

```bash
# Test from server
ssh roel@merlina.develry.be
curl http://localhost:8787/api/versions  # Should return JSON

# Test from your machine
curl https://www.wcag.be/api/versions    # Should return same JSON
```

## Managing the API

### PM2 Commands (on server)

```bash
# Check status
pm2 status

# View logs
pm2 logs wcag-api

# Restart API
pm2 restart wcag-api

# Stop API
pm2 stop wcag-api

# Start API
pm2 start wcag-api

# Monitor resources
pm2 monit
```

### Logs

```bash
# Real-time logs
pm2 logs wcag-api --lines 100

# Error logs only
tail -f /home/roel/websites/wcag.be/logs/api-error.log

# Output logs only
tail -f /home/roel/websites/wcag.be/logs/api-out.log
```

## Updating the Application

### Workflow

1. **Make changes locally**
   - Edit code
   - Test locally: `npm run dev`
   - Update database via admin interface (if needed)

2. **Deploy**
   ```bash
   cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer
   ./deploy-full.sh
   ```

3. **Verify**
   - Visit https://www.wcag.be/
   - Test functionality
   - Check logs if needed: `ssh roel@merlina.develry.be pm2 logs wcag-api`

### Deploy Only Frontend

If you only changed frontend code (no API/database changes):

```bash
cd apps/web
./deploy-simple.sh
```

This is faster as it skips API and database deployment.

## Rollback

If something goes wrong, restore from backup:

```bash
ssh roel@merlina.develry.be
cd /home/roel/websites/wcag.be/backups

# List backups
ls -lh wcag-full-backup-*.tar.gz

# Restore frontend
tar -xzf wcag-full-backup-20251114_120000-frontend.tar.gz -C ../public/

# Restore backend (if needed)
tar -xzf wcag-full-backup-20251114_120000-backend.tar.gz -C ../api/

# Restore database (if needed)
tar -xzf wcag-full-backup-20251114_120000-data.tar.gz -C ../data/

# Restart API
pm2 restart wcag-api
```

## Troubleshooting

### Frontend Issues

**Problem**: Page shows 404 or blank screen
**Solution**:
```bash
# Check files deployed
ssh roel@merlina.develry.be
ls -la /home/roel/websites/wcag.be/public/

# Should see index.html and assets/ directory
```

### API Issues

**Problem**: API returns 502 Bad Gateway
**Solution**:
```bash
# Check if API is running
ssh roel@merlina.develry.be
pm2 status

# If not running, start it
pm2 start wcag-api

# Check logs for errors
pm2 logs wcag-api --err
```

**Problem**: API returns old data
**Solution**:
```bash
# Database wasn't uploaded or API is cached
ssh roel@merlina.develry.be
pm2 restart wcag-api
```

### Database Issues

**Problem**: Data not updating
**Solution**:
```bash
# Check database file
ssh roel@merlina.develry.be
ls -lh /home/roel/websites/wcag.be/data/wcag.sqlite

# Check modified date - should match deployment time
stat /home/roel/websites/wcag.be/data/wcag.sqlite
```

### Build Issues

**Problem**: Build fails locally
**Solution**:
```bash
# Clean and rebuild
cd apps/web
rm -rf dist/ node_modules/
npm install
npm run build
```

## Performance Monitoring

### Check API Performance

```bash
ssh roel@merlina.develry.be

# PM2 metrics
pm2 monit

# Memory usage
pm2 list
```

### Check Frontend Performance

Use Chrome DevTools Lighthouse:
- Open https://www.wcag.be/
- F12 → Lighthouse tab
- Run audit
- Target: 90+ scores

## Security Notes

### ✅ Good Security Practices

- 🔒 Admin interface **never deployed** (local only)
- 🔒 API only accepts GET requests (read-only)
- 🔒 HTTPS enforced via Nginx
- 🔒 API not exposed publicly (runs on localhost:8787)
- 🔒 CORS configured to only allow your domain

### ⚠️ Important

- Change `ADMIN_PASSWORD` in `ecosystem.json` (even though admin routes aren't exposed)
- Keep backups secure (they contain full database)
- Monitor logs for suspicious activity

## Quick Reference

### Deploy Everything
```bash
cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer
./deploy-full.sh
```

### Deploy Frontend Only
```bash
cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web
./deploy-simple.sh
```

### Check Status
```bash
ssh roel@merlina.develry.be pm2 status
```

### View Logs
```bash
ssh roel@merlina.develry.be pm2 logs wcag-api
```

### Restart API
```bash
ssh roel@merlina.develry.be pm2 restart wcag-api
```

## File Structure Summary

```
Local Machine:
  /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/
  ├── apps/web/          # Frontend source
  ├── apps/api/          # API source
  ├── apps/admin/        # Admin interface (LOCAL ONLY)
  ├── data/wcag.sqlite   # Master database
  └── deploy-full.sh     # Deployment script

Production Server:
  /home/roel/websites/wcag.be/
  ├── public/            # Deployed frontend
  ├── api/               # Deployed API
  ├── data/              # Deployed database
  ├── logs/              # Application logs
  └── backups/           # Automatic backups
```

## Support Checklist

Before asking for help:

- [ ] Check deployment script output for errors
- [ ] Verify SSH connection: `ssh roel@merlina.develry.be`
- [ ] Check API status: `pm2 status`
- [ ] Check API logs: `pm2 logs wcag-api`
- [ ] Check Nginx logs: `sudo tail -f /var/log/nginx/wcag.be-error.log`
- [ ] Test API directly: `curl http://localhost:8787/api/versions`
- [ ] Test public URL: `curl https://www.wcag.be/api/versions`
- [ ] Clear browser cache and try again

---

**Last Updated**: November 14, 2025
**Average Deploy Time**: ~2 minutes
**Database Size**: ~5 MB (very fast to upload)
