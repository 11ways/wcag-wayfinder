# WCAG Wayfinder - Deployment Guide

This guide explains how to deploy WCAG Wayfinder from your local machine to your server.

## Server Information

- **Server**: merlina.develry.be
- **User**: roel
- **Deploy Path**: `/home/roel/websites/wcag.be/public`
- **URL**: https://www.wcag.be/

## Server Status ✅

Your server **exceeds all requirements**:

- ✅ **OS**: Ubuntu Linux 5.15
- ✅ **Node.js**: v20.18.0 (requirement: v18+)
- ✅ **Web Servers**: Nginx AND Apache2 (both active)
- ✅ **Disk Space**: 160GB available
- ✅ **HTTPS**: Configured and working
- ✅ **Directory**: Exists and is writable

## Deployment Options

### Option 1: Simple Deployment (Recommended)

Uses `rsync` or `scp` - no additional tools required.

```bash
./deploy-simple.sh
```

**What it does:**
1. Checks SSH connection
2. Builds the application (`npm run build`)
3. Creates backup of current deployment
4. Clears deployment directory
5. Uploads files via rsync (or scp if rsync unavailable)
6. Verifies deployment
7. Sets correct file permissions

### Option 2: Rclone Deployment

Your existing script using `rclone` (requires rclone setup).

```bash
./deploy.sh
```

**Prerequisites:**
- Install rclone: `brew install rclone` (macOS)
- Configure remote:
  ```bash
  rclone config create wcag-be sftp \
    host merlina.develry.be \
    user roel \
    port 22 \
    key_file ~/.ssh/id_ed25519
  ```

## Pre-Deployment Check

Run the server check script to verify everything is ready:

```bash
./check-server.sh
```

This will verify:
- SSH connection
- Server OS and specs
- Node.js version
- Web server configuration
- Deployment directory
- Disk space
- HTTPS configuration

## First-Time Setup

### 1. Ensure SSH Access

Test your SSH connection:

```bash
ssh roel@merlina.develry.be "echo 'Connection successful'"
```

If this fails, add your SSH key to the server:

```bash
# Copy your SSH key to the server
ssh-copy-id roel@merlina.develry.be

# Or manually add your public key
cat ~/.ssh/id_ed25519.pub
# Then paste into ~/.ssh/authorized_keys on the server
```

### 2. Configure API Endpoint (If Needed)

The frontend currently expects the API at `/api`. Make sure your web server is configured to:

**Option A**: Proxy `/api` requests to your backend
**Option B**: Serve the API from the same domain

Example Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name www.wcag.be;

    # Frontend - serve static files
    root /home/roel/websites/wcag.be/public;
    index index.html;

    # SPA routing - redirect all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if backend is separate)
    location /api {
        proxy_pass http://localhost:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deployment Process

### Step-by-Step

1. **Navigate to project directory:**
   ```bash
   cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web
   ```

2. **Run server check (optional but recommended):**
   ```bash
   ./check-server.sh
   ```

3. **Deploy:**
   ```bash
   ./deploy-simple.sh
   ```

4. **Verify deployment:**
   - Visit https://www.wcag.be/
   - Test search functionality
   - Test filters
   - Check browser console for errors
   - Test on mobile devices

### What Gets Deployed

From the `dist/` folder:
- `index.html` (~6 KB)
- `assets/js/*.js` (~509 KB total, 6 chunks)
- `assets/css/*.css` (~71 KB)
- `content/` directory (markdown files)
  - `walkthrough/` - Onboarding tour content
  - `help/` - Help documentation
  - `warnings/` - Warning messages
  - `filters/` - Filter help
  - `levels/` - Level descriptions

### Automatic Backups

The deployment script automatically creates backups:

- **Location**: `/home/roel/websites/wcag.be/backups/`
- **Format**: `wcag-backup-YYYYMMDD_HHMMSS.tar.gz`
- **Retention**: Last 5 backups are kept

### Rollback

If something goes wrong, rollback to the previous version:

```bash
# SSH into the server
ssh roel@merlina.develry.be

# Go to backups directory
cd /home/roel/websites/wcag.be/backups

# List available backups
ls -lh wcag-backup-*.tar.gz

# Restore a backup
tar -xzf wcag-backup-20251114_143000.tar.gz -C ../public/
```

## Troubleshooting

### SSH Connection Fails

```bash
# Test connection
ssh roel@merlina.develry.be "echo test"

# Check SSH config
cat ~/.ssh/config | grep merlina

# Verify key
ls -la ~/.ssh/id_ed25519
```

### Build Fails

```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check for TypeScript errors
npm run typecheck
```

### Deployment Succeeds But Site Not Working

1. **Check file permissions:**
   ```bash
   ssh roel@merlina.develry.be "ls -la /home/roel/websites/wcag.be/public/"
   ```

2. **Check web server logs:**
   ```bash
   ssh roel@merlina.develry.be "sudo tail -50 /var/log/nginx/error.log"
   ```

3. **Verify SPA routing:**
   - Make sure all routes redirect to `index.html`
   - Test: https://www.wcag.be/settings (should work, not 404)

### API Not Working

1. **Check if API backend is running:**
   ```bash
   ssh roel@merlina.develry.be "curl -I http://localhost:8787/api/criteria"
   ```

2. **Check proxy configuration** in Nginx/Apache

3. **Check CORS headers** if API is on different domain

## Performance Optimization

After deployment, verify performance:

1. **Run Lighthouse audit** (target: 90+ scores)
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run audit

2. **Check bundle size:**
   ```bash
   npm run build
   # Look for bundle size warnings
   ```

3. **Verify compression:**
   ```bash
   curl -I -H "Accept-Encoding: gzip" https://www.wcag.be/assets/js/index-*.js
   # Should see: Content-Encoding: gzip
   ```

## Continuous Deployment

For frequent deployments, consider:

1. **Alias in .bashrc/.zshrc:**
   ```bash
   alias deploy-wcag="cd /Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/apps/web && ./deploy-simple.sh"
   ```

2. **Git hook** for automatic deployment on push (advanced)

3. **GitHub Actions** for CI/CD (if deploying from GitHub)

## Security Checklist

- [ ] HTTPS is enabled and working
- [ ] SSL certificate is valid (not expired)
- [ ] SSH key authentication is used (not passwords)
- [ ] File permissions are correct (644 for files, 755 for directories)
- [ ] `.env` files are not deployed (if any)
- [ ] Source maps are excluded or hidden (security by obscurity)
- [ ] API endpoints are protected (rate limiting, authentication if needed)

## Quick Reference

### Commands

```bash
# Check server requirements
./check-server.sh

# Deploy (simple method)
./deploy-simple.sh

# Deploy (rclone method)
./deploy.sh

# SSH to server
ssh roel@merlina.develry.be

# View live site
open https://www.wcag.be/
```

### File Locations

```
Local:  ./dist/
Remote: /home/roel/websites/wcag.be/public/
Backup: /home/roel/websites/wcag.be/backups/
```

### Support

For issues or questions:
1. Check this guide
2. Check server logs
3. Test locally first: `npm run preview`
4. Verify build output: `ls -R dist/`

---

**Last Updated**: November 14, 2025
**Deployment Method**: rsync/scp (simple) or rclone
**Average Deployment Time**: ~30 seconds
