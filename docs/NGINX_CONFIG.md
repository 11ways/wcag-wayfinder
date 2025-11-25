# Nginx Configuration for WCAG Wayfinder

This guide explains how to configure Nginx to serve both the frontend and proxy requests to the API backend.

## Configuration File

The Nginx config should be located at:
- `/etc/nginx/sites-available/wcag.be`
- Symlinked to: `/etc/nginx/sites-enabled/wcag.be`

## Complete Nginx Configuration

```nginx
# WCAG Wayfinder - Nginx Configuration
# File: /etc/nginx/sites-available/wcag.be

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name wcag.be www.wcag.be;

    # Redirect all HTTP to HTTPS
    return 301 https://www.wcag.be$request_uri;
}

# Redirect non-www to www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name wcag.be;

    # SSL Configuration (adjust paths to your certificates)
    ssl_certificate /etc/letsencrypt/live/wcag.be/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wcag.be/privkey.pem;

    # Redirect to www
    return 301 https://www.wcag.be$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.wcag.be;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/wcag.be/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wcag.be/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory for frontend
    root /home/roel/websites/wcag.be/public;
    index index.html;

    # Logs
    access_log /var/log/nginx/wcag.be-access.log;
    error_log /var/log/nginx/wcag.be-error.log;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json
               image/svg+xml;

    # API Proxy - Forward /api requests to backend
    location /api {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Frontend - Static files with aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;

        # CORS headers for fonts
        add_header Access-Control-Allow-Origin "*";

        try_files $uri =404;
    }

    # Markdown content files - moderate caching
    location ~* \.md$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
        default_type text/markdown;
    }

    # SPA Routing - All other requests go to index.html
    location / {
        try_files $uri $uri/ /index.html;

        # No caching for index.html
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

## Installation Steps

### 1. Create the Configuration File

```bash
# SSH into the server
ssh roel@merlina.develry.be

# Create the config file
sudo nano /etc/nginx/sites-available/wcag.be

# Paste the configuration above
# Save and exit (Ctrl+X, Y, Enter)
```

### 2. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/wcag.be /etc/nginx/sites-enabled/wcag.be

# Remove default site if needed
sudo rm /etc/nginx/sites-enabled/default
```

### 3. Test Configuration

```bash
# Test nginx configuration
sudo nginx -t

# Should see:
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4. Reload Nginx

```bash
# Reload nginx
sudo systemctl reload nginx

# Or restart if needed
sudo systemctl restart nginx
```

### 5. Check Status

```bash
# Check nginx status
sudo systemctl status nginx

# Check if nginx is listening on ports
sudo ss -tlnp | grep nginx
# Should show ports 80 and 443
```

## SSL Certificate Setup (Let's Encrypt)

If you don't have SSL certificates yet:

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d wcag.be -d www.wcag.be

# Certbot will automatically configure nginx for HTTPS
```

Auto-renewal is set up automatically. Verify with:

```bash
# Test renewal
sudo certbot renew --dry-run
```

## Troubleshooting

### Check Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/wcag.be-error.log
```

### Check if API is Running

```bash
# Test API directly
curl http://localhost:8787/api/versions

# Should return JSON with WCAG versions
```

### Check PM2 Status

```bash
pm2 status
pm2 logs wcag-api
```

### Test Proxy

```bash
# From local machine
curl https://www.wcag.be/api/versions

# Should return same JSON as above
```

### Common Issues

**Problem**: 502 Bad Gateway
**Solution**: API is not running. Check PM2: `pm2 status` and `pm2 logs wcag-api`

**Problem**: 404 on routes like /settings
**Solution**: SPA routing not configured. Check `try_files` directive in nginx config.

**Problem**: Static files not loading
**Solution**: Check file permissions: `sudo chmod -R 755 /home/roel/websites/wcag.be/public`

**Problem**: CORS errors
**Solution**: Check `ALLOWED_ORIGINS` in PM2 ecosystem.json includes your domain

## Performance Verification

### Test Gzip Compression

```bash
curl -I -H "Accept-Encoding: gzip" https://www.wcag.be/assets/js/index-*.js

# Should see:
# Content-Encoding: gzip
```

### Test Caching Headers

```bash
# Static assets should have long cache
curl -I https://www.wcag.be/assets/css/index-*.css
# Should see: Cache-Control: public, immutable

# index.html should not be cached
curl -I https://www.wcag.be/
# Should see: Cache-Control: no-cache, must-revalidate
```

### Test HTTP/2

```bash
curl -I --http2 https://www.wcag.be/
# Should see: HTTP/2 200
```

## Monitoring

### Check Nginx Access Logs

```bash
# Real-time access log
sudo tail -f /var/log/nginx/wcag.be-access.log
```

### Check Resource Usage

```bash
# Nginx status
sudo systemctl status nginx

# API (PM2) status
pm2 status
pm2 monit
```

## Quick Reference

```bash
# Restart all services
sudo systemctl restart nginx
pm2 restart wcag-api

# View all logs
sudo tail -f /var/log/nginx/wcag.be-error.log  # Nginx errors
pm2 logs wcag-api                               # API logs

# Test API locally on server
curl http://localhost:8787/api/versions

# Test public URL
curl https://www.wcag.be/api/versions
```

## Notes

- The API runs on `localhost:8787` (not exposed publicly)
- Nginx proxies `/api/*` requests to the API backend
- Frontend is served directly by Nginx
- PM2 keeps the API running and auto-restarts on crashes
- SSL certificates auto-renew via certbot
- Both Nginx and Apache are running, make sure this config is in Nginx

---

**Last Updated**: November 14, 2025
