#!/bin/bash
#
# Server Requirements Check Script
# This script verifies that merlina.develry.be meets all requirements
#

set -e

SERVER="roel@merlina.develry.be"
DEPLOY_DIR="/home/roel/websites/wcag.be/public"

echo "================================================"
echo "WCAG Wayfinder - Server Requirements Check"
echo "================================================"
echo ""

# Test SSH connection
echo "✓ Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 "$SERVER" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✗ ERROR: Cannot connect to $SERVER"
    echo ""
    echo "Please ensure:"
    echo "  1. Your SSH key is added to the server"
    echo "  2. Run: ssh-copy-id $SERVER"
    echo "  3. Or manually add your key to ~/.ssh/authorized_keys on the server"
    exit 1
fi
echo "  ✓ SSH connection working"
echo ""

# Check server OS
echo "✓ Checking server OS..."
OS_INFO=$(ssh "$SERVER" "uname -s && uname -r")
echo "  ✓ OS: $OS_INFO"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ssh "$SERVER" "command -v node >/dev/null 2>&1"; then
    NODE_VERSION=$(ssh "$SERVER" "node --version 2>/dev/null || echo 'unknown'")
    echo "  ✓ Node.js installed: $NODE_VERSION"

    # Check if version is >= 18
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -ge 18 ] 2>/dev/null; then
        echo "  ✓ Node.js version is sufficient (>=18)"
    else
        echo "  ⚠ Warning: Node.js version may be too old (need >=18)"
    fi
else
    echo "  ⚠ Node.js not found (only needed if running API backend on this server)"
fi
echo ""

# Check web server
echo "✓ Checking web server..."
WEB_SERVER=""
if ssh "$SERVER" "command -v nginx >/dev/null 2>&1"; then
    NGINX_VERSION=$(ssh "$SERVER" "nginx -v 2>&1 | cut -d/ -f2")
    echo "  ✓ Nginx installed: $NGINX_VERSION"
    WEB_SERVER="nginx"
elif ssh "$SERVER" "command -v apache2 >/dev/null 2>&1"; then
    APACHE_VERSION=$(ssh "$SERVER" "apache2 -v 2>&1 | head -1 | cut -d/ -f2 | cut -d' ' -f1")
    echo "  ✓ Apache installed: $APACHE_VERSION"
    WEB_SERVER="apache"
elif ssh "$SERVER" "command -v caddy >/dev/null 2>&1"; then
    CADDY_VERSION=$(ssh "$SERVER" "caddy version 2>&1 | head -1")
    echo "  ✓ Caddy installed: $CADDY_VERSION"
    WEB_SERVER="caddy"
else
    echo "  ✗ No web server found (nginx, apache2, or caddy)"
    exit 1
fi
echo ""

# Check deployment directory
echo "✓ Checking deployment directory..."
if ssh "$SERVER" "test -d $DEPLOY_DIR"; then
    echo "  ✓ Directory exists: $DEPLOY_DIR"

    # Check write permissions
    if ssh "$SERVER" "test -w $DEPLOY_DIR"; then
        echo "  ✓ Directory is writable"
    else
        echo "  ✗ Directory is not writable"
        echo "  Please fix permissions: sudo chown -R \$USER:www-data $DEPLOY_DIR"
        exit 1
    fi

    # Check current contents
    FILE_COUNT=$(ssh "$SERVER" "ls -1 $DEPLOY_DIR 2>/dev/null | wc -l | tr -d ' '")
    echo "  ℹ Current files in directory: $FILE_COUNT"
else
    echo "  ⚠ Directory does not exist: $DEPLOY_DIR"
    echo "  Attempting to create..."
    if ssh "$SERVER" "mkdir -p $DEPLOY_DIR"; then
        echo "  ✓ Directory created"
    else
        echo "  ✗ Could not create directory"
        exit 1
    fi
fi
echo ""

# Check disk space
echo "✓ Checking disk space..."
DISK_INFO=$(ssh "$SERVER" "df -h $DEPLOY_DIR | tail -1")
DISK_AVAIL=$(echo "$DISK_INFO" | awk '{print $4}')
echo "  ✓ Available space: $DISK_AVAIL"
echo ""

# Check HTTPS configuration
echo "✓ Checking HTTPS configuration..."
if curl -sI -o /dev/null -w "%{http_code}" --connect-timeout 5 https://www.wcag.be/ 2>/dev/null | grep -q "^[23]"; then
    echo "  ✓ HTTPS is configured and working"
else
    echo "  ⚠ HTTPS may not be configured (https://www.wcag.be/ not accessible)"
fi
echo ""

# Summary
echo "================================================"
echo "SUMMARY"
echo "================================================"
echo "Server: $SERVER"
echo "Web Server: $WEB_SERVER"
echo "Node.js: ${NODE_VERSION:-Not installed}"
echo "Deploy Directory: $DEPLOY_DIR"
echo "Disk Space: $DISK_AVAIL available"
echo ""
echo "✓ Server meets basic requirements for deployment!"
echo ""
echo "Next steps:"
echo "  1. Run './deploy.sh' to deploy the application"
echo "  2. Ensure your API backend is configured (if needed)"
echo "  3. Configure $WEB_SERVER for SPA routing (redirect all routes to index.html)"
echo ""
