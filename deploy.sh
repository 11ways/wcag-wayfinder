#!/bin/bash
#
# WCAG Wayfinder - Deployment Script
# Deploys frontend, API, and/or database with interactive menu
#
# Usage:
#   ./deploy.sh              # Interactive menu
#   ./deploy.sh --frontend   # Deploy frontend only
#   ./deploy.sh --api        # Deploy API only
#   ./deploy.sh --database   # Deploy database only
#   ./deploy.sh --all        # Deploy everything
#   ./deploy.sh --help       # Show help
#

set -euo pipefail
IFS=$'\n\t'

# Configuration
SERVER="roel@merlina.develry.be"
REMOTE_BASE="/home/roel/websites/wcag.be"
FRONTEND_DIR="$REMOTE_BASE/public"
API_DIR="$REMOTE_BASE/api"
DATA_DIR="$REMOTE_BASE/data"
BACKUP_DIR="$REMOTE_BASE/backups"

# Local paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_WEB="$SCRIPT_DIR/apps/web"
LOCAL_API="$SCRIPT_DIR/apps/api"
LOCAL_DB_PKG="$SCRIPT_DIR/packages/db"
LOCAL_DATA="$SCRIPT_DIR/data"

# Deployment flags
DEPLOY_FRONTEND=false
DEPLOY_API=false
DEPLOY_DATABASE=false
SKIP_BUILD=false
SKIP_INSTALL=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Logging helpers
log_info() { echo -e "${BLUE}→${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_section() { echo -e "\n${CYAN}${BOLD}▸ $1${NC}"; }

# Show help
show_help() {
    echo "WCAG Wayfinder - Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --frontend, -f     Deploy frontend (web app)"
    echo "  --api, -a          Deploy API (server code + packages/db)"
    echo "  --database, -d     Deploy database (SQLite)"
    echo "  --all              Deploy everything"
    echo "  --skip-build       Skip frontend build (use existing dist/)"
    echo "  --skip-install     Skip bun install on server"
    echo "  --help, -h         Show this help"
    echo ""
    echo "Without options, an interactive menu will be shown."
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh                    # Interactive menu"
    echo "  ./deploy.sh --frontend         # Deploy frontend only"
    echo "  ./deploy.sh --api --database   # Deploy API and database"
    echo "  ./deploy.sh --all --skip-build # Full deploy, reuse existing build"
    exit 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --frontend|-f)
                DEPLOY_FRONTEND=true
                shift
                ;;
            --api|-a)
                DEPLOY_API=true
                shift
                ;;
            --database|--db|-d)
                DEPLOY_DATABASE=true
                shift
                ;;
            --all)
                DEPLOY_FRONTEND=true
                DEPLOY_API=true
                DEPLOY_DATABASE=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-install)
                SKIP_INSTALL=true
                shift
                ;;
            --help|-h)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

# Show interactive menu
show_menu() {
    clear
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${BOLD}  WCAG Wayfinder - Deployment${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  What would you like to deploy?"
    echo ""
    echo -e "  ${BOLD}1)${NC} Frontend only        ${CYAN}(web app → wcag.be)${NC}"
    echo -e "  ${BOLD}2)${NC} API only             ${CYAN}(server → api.wcag.be)${NC}"
    echo -e "  ${BOLD}3)${NC} Database only        ${CYAN}(SQLite data)${NC}"
    echo -e "  ${BOLD}4)${NC} Frontend + API       ${CYAN}(code changes)${NC}"
    echo -e "  ${BOLD}5)${NC} Everything           ${CYAN}(full deployment)${NC}"
    echo ""
    echo -e "  ${BOLD}0)${NC} Cancel"
    echo ""
    read -p "  Select option [0-5]: " -n 1 -r choice
    echo ""

    case $choice in
        1) DEPLOY_FRONTEND=true ;;
        2) DEPLOY_API=true ;;
        3) DEPLOY_DATABASE=true ;;
        4) DEPLOY_FRONTEND=true; DEPLOY_API=true ;;
        5) DEPLOY_FRONTEND=true; DEPLOY_API=true; DEPLOY_DATABASE=true ;;
        0|*)
            echo ""
            log_warning "Deployment cancelled"
            exit 0
            ;;
    esac
}

# Pre-flight checks
preflight_checks() {
    log_section "Pre-flight Checks"

    # Check we're in the right directory
    if [ ! -f "$SCRIPT_DIR/package.json" ]; then
        log_error "package.json not found in $SCRIPT_DIR"
        exit 1
    fi

    # Check rsync
    if ! command -v rsync > /dev/null 2>&1; then
        log_error "rsync is not installed"
        exit 1
    fi

    # Check SSH connection
    log_info "Testing SSH connection..."
    if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'ok'" > /dev/null 2>&1; then
        log_error "Cannot connect to $SERVER"
        echo "  Check your SSH configuration"
        exit 1
    fi
    log_success "SSH connection OK"

    # Check Bun on server (if deploying API)
    if $DEPLOY_API; then
        log_info "Checking Bun on server..."
        if ssh "$SERVER" "test -f ~/.bun/bin/bun"; then
            BUN_VERSION=$(ssh "$SERVER" "~/.bun/bin/bun --version" 2>/dev/null || echo "unknown")
            log_success "Bun v$BUN_VERSION"
        else
            log_warning "Bun not found on server - installing..."
            ssh "$SERVER" "curl -fsSL https://bun.sh/install | bash"
            log_success "Bun installed"
        fi
    fi

    log_success "All checks passed"
}

# Build frontend
build_frontend() {
    log_section "Building Frontend"

    if $SKIP_BUILD; then
        if [ ! -d "$LOCAL_WEB/dist" ] || [ -z "$(ls -A "$LOCAL_WEB/dist" 2>/dev/null)" ]; then
            log_error "No existing build found. Remove --skip-build flag."
            exit 1
        fi
        log_warning "Using existing build (--skip-build)"
    else
        log_info "Running build..."
        cd "$LOCAL_WEB"
        if bun run build > /dev/null 2>&1; then
            log_success "Build complete"
        else
            log_error "Build failed"
            exit 1
        fi
        cd "$SCRIPT_DIR"
    fi

    FILE_COUNT=$(find "$LOCAL_WEB/dist" -type f | wc -l | tr -d ' ')
    echo "  $FILE_COUNT files ready"
}

# Deploy frontend
deploy_frontend() {
    log_section "Deploying Frontend"

    # Preview changes
    log_info "Checking for changes..."
    CHANGES=$(rsync -avzn --delete \
        --exclude='.DS_Store' \
        --exclude='*.map' \
        "$LOCAL_WEB/dist/" "$SERVER:$FRONTEND_DIR/" 2>&1 | grep -E "^(deleting|>|<)" || true)

    if [ -z "$CHANGES" ]; then
        log_success "No changes - frontend is up to date"
        return 0
    fi

    NEW_COUNT=$(echo "$CHANGES" | grep -c "^>" || true)
    DEL_COUNT=$(echo "$CHANGES" | grep -c "^deleting" || true)
    echo -e "  ${GREEN}+${NC} $NEW_COUNT new/updated"
    [ "$DEL_COUNT" -gt 0 ] && echo -e "  ${RED}-${NC} $DEL_COUNT deleted"

    # Backup
    log_info "Creating backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ssh "$SERVER" "mkdir -p $BACKUP_DIR"
    if ssh "$SERVER" "test -d $FRONTEND_DIR && [ \$(ls -A $FRONTEND_DIR 2>/dev/null | wc -l) -gt 0 ]"; then
        ssh "$SERVER" "cd $FRONTEND_DIR && tar -czf $BACKUP_DIR/frontend-$TIMESTAMP.tar.gz . 2>/dev/null || true"
        log_success "Backup: frontend-$TIMESTAMP.tar.gz"
    fi

    # Deploy
    log_info "Uploading files..."
    rsync -avz --delete \
        --exclude='.DS_Store' \
        --exclude='*.map' \
        "$LOCAL_WEB/dist/" "$SERVER:$FRONTEND_DIR/" > /dev/null

    # Permissions
    ssh "$SERVER" "find $FRONTEND_DIR -type f -exec chmod 644 {} \; && find $FRONTEND_DIR -type d -exec chmod 755 {} \;"

    # Verify
    if ssh "$SERVER" "test -f $FRONTEND_DIR/index.html"; then
        DEPLOYED=$(ssh "$SERVER" "find $FRONTEND_DIR -type f | wc -l | tr -d ' '")
        log_success "Frontend deployed ($DEPLOYED files)"
    else
        log_error "Deployment failed - index.html not found"
        exit 1
    fi
}

# Deploy API
deploy_api() {
    log_section "Deploying API"

    # Check local files exist
    if [ ! -d "$LOCAL_API" ]; then
        log_error "API directory not found: $LOCAL_API"
        exit 1
    fi

    # Preview changes
    log_info "Checking for changes..."
    API_CHANGES=$(rsync -avzn \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.DS_Store' \
        "$LOCAL_API/" "$SERVER:$API_DIR/apps/api/" 2>&1 | grep -E "^>" || true)

    PKG_CHANGES=$(rsync -avzn \
        --exclude='node_modules' \
        --exclude='.DS_Store' \
        --exclude='wcag.db' \
        "$LOCAL_DB_PKG/" "$SERVER:$API_DIR/packages/db/" 2>&1 | grep -E "^>" || true)

    # Count non-empty lines
    API_COUNT=0
    PKG_COUNT=0
    [ -n "$API_CHANGES" ] && API_COUNT=$(echo "$API_CHANGES" | wc -l | tr -d ' ')
    [ -n "$PKG_CHANGES" ] && PKG_COUNT=$(echo "$PKG_CHANGES" | wc -l | tr -d ' ')

    if [ "$API_COUNT" -eq 0 ] && [ "$PKG_COUNT" -eq 0 ]; then
        log_success "No changes - API is up to date"
        return 0
    fi

    echo "  apps/api: $API_COUNT file(s)"
    echo "  packages/db: $PKG_COUNT file(s)"

    # Backup
    log_info "Creating backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ssh "$SERVER" "mkdir -p $BACKUP_DIR"
    if ssh "$SERVER" "test -d $API_DIR/apps/api"; then
        ssh "$SERVER" "cd $API_DIR && tar -czf $BACKUP_DIR/api-$TIMESTAMP.tar.gz apps/api packages/db 2>/dev/null || true"
        log_success "Backup: api-$TIMESTAMP.tar.gz"
    fi

    # Create directories
    ssh "$SERVER" "mkdir -p $API_DIR/apps/api/src $API_DIR/packages/db/src $API_DIR/data"

    # Deploy API
    log_info "Uploading API..."
    rsync -avz \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.DS_Store' \
        "$LOCAL_API/" "$SERVER:$API_DIR/apps/api/" > /dev/null

    # Deploy packages/db
    log_info "Uploading packages/db..."
    rsync -avz \
        --exclude='node_modules' \
        --exclude='.DS_Store' \
        --exclude='wcag.db' \
        "$LOCAL_DB_PKG/" "$SERVER:$API_DIR/packages/db/" > /dev/null

    # Deploy root package files
    rsync -avz \
        "$SCRIPT_DIR/package.json" \
        "$SCRIPT_DIR/bun.lock" \
        "$SERVER:$API_DIR/" > /dev/null 2>&1 || true

    # Install dependencies
    if ! $SKIP_INSTALL; then
        log_info "Installing dependencies..."
        ssh "$SERVER" "cd $API_DIR && ~/.bun/bin/bun install" > /dev/null 2>&1
        log_success "Dependencies installed"
    fi

    # Ensure server.js wrapper exists
    ensure_server_wrapper

    # Restart API
    restart_api

    log_success "API deployed"
}

# Ensure server.js wrapper exists for Hohenheim
ensure_server_wrapper() {
    log_info "Checking Hohenheim wrapper..."

    WRAPPER_EXISTS=$(ssh "$SERVER" "test -f $API_DIR/apps/api/src/server.js && echo 'yes' || echo 'no'")

    if [ "$WRAPPER_EXISTS" = "no" ]; then
        log_warning "Creating server.js wrapper..."
        ssh "$SERVER" "cat > $API_DIR/apps/api/src/server.js << 'WRAPPER_EOF'
#!/usr/bin/env node
// Wrapper to run Bun API server with port from Hohenheim
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const portArg = process.argv.find(arg => arg.startsWith('--port='));
const port = portArg ? portArg.split('=')[1] : '8787';

process.env.PORT = port;
process.env.NODE_ENV = 'production';
process.env.ALLOWED_ORIGINS = 'https://www.wcag.be,https://wcag.be,https://api.wcag.be';

const bunPath = '/home/roel/.bun/bin/bun';
const scriptPath = join(__dirname, 'index.ts');

const child = spawn(bunPath, ['run', scriptPath], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
});
WRAPPER_EOF"
        ssh "$SERVER" "chmod +x $API_DIR/apps/api/src/server.js"
        log_success "Wrapper created"
    else
        log_success "Wrapper exists"
    fi
}

# Restart API via Hohenheim
restart_api() {
    log_info "Restarting API..."

    # Find and kill the API process - Hohenheim will auto-restart
    API_PID=$(ssh "$SERVER" "pgrep -f 'wcag.be/api/apps/api/src/server.js' | head -1" 2>/dev/null || true)

    if [ -n "$API_PID" ]; then
        ssh "$SERVER" "kill $API_PID 2>/dev/null || true"
        log_info "Waiting for restart..."
        sleep 3

        # Verify
        if ssh "$SERVER" "curl -s http://localhost:4751/api/principles > /dev/null 2>&1"; then
            log_success "API restarted"
        else
            log_warning "API may still be starting - verify manually"
        fi
    else
        log_warning "API process not found - may need manual restart via Hohenheim"
    fi
}

# Deploy database
deploy_database() {
    log_section "Deploying Database"

    LOCAL_DB="$LOCAL_DATA/wcag.sqlite"
    REMOTE_DB="$DATA_DIR/wcag.sqlite"

    if [ ! -f "$LOCAL_DB" ]; then
        log_error "Database not found: $LOCAL_DB"
        exit 1
    fi

    # Compare sizes
    LOCAL_SIZE=$(stat -f%z "$LOCAL_DB" 2>/dev/null || stat --printf="%s" "$LOCAL_DB")
    REMOTE_SIZE=$(ssh "$SERVER" "stat -c%s $REMOTE_DB 2>/dev/null || echo 0")

    echo "  Local:  $(echo "$LOCAL_SIZE" | awk '{printf "%.2f MB", $1/1024/1024}')"
    echo "  Remote: $(echo "$REMOTE_SIZE" | awk '{printf "%.2f MB", $1/1024/1024}')"

    # Backup
    log_info "Creating backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ssh "$SERVER" "mkdir -p $BACKUP_DIR $DATA_DIR"
    if ssh "$SERVER" "test -f $REMOTE_DB"; then
        ssh "$SERVER" "cp $REMOTE_DB $BACKUP_DIR/database-$TIMESTAMP.sqlite"
        log_success "Backup: database-$TIMESTAMP.sqlite"
    fi

    # Deploy
    log_info "Uploading database..."
    rsync -avz "$LOCAL_DB" "$SERVER:$REMOTE_DB" > /dev/null

    # Also copy to API data directory
    ssh "$SERVER" "mkdir -p $API_DIR/data && cp $REMOTE_DB $API_DIR/data/"

    # Permissions
    ssh "$SERVER" "chmod 644 $REMOTE_DB $API_DIR/data/wcag.sqlite 2>/dev/null || true"

    # Verify
    NEW_SIZE=$(ssh "$SERVER" "stat -c%s $REMOTE_DB 2>/dev/null || echo 0")
    log_success "Database deployed ($(echo "$NEW_SIZE" | awk '{printf "%.2f MB", $1/1024/1024}'))"
}

# Cleanup old backups
cleanup_backups() {
    log_info "Cleaning up old backups..."
    ssh "$SERVER" "cd $BACKUP_DIR && ls -t frontend-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true"
    ssh "$SERVER" "cd $BACKUP_DIR && ls -t api-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true"
    ssh "$SERVER" "cd $BACKUP_DIR && ls -t database-*.sqlite 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true"
}

# Verify deployment
verify_deployment() {
    log_section "Verification"

    if $DEPLOY_FRONTEND; then
        log_info "Testing frontend..."
        if curl -s -o /dev/null -w "%{http_code}" "https://wcag.be" | grep -q "200"; then
            log_success "Frontend: https://wcag.be"
        else
            log_warning "Frontend may need a moment to propagate"
        fi
    fi

    if $DEPLOY_API; then
        log_info "Testing API..."
        sleep 2  # Give API time to restart
        API_RESPONSE=$(curl -s "https://api.wcag.be/api/versions" 2>/dev/null || echo "")
        if [ -n "$API_RESPONSE" ] && echo "$API_RESPONSE" | grep -q "2.2"; then
            log_success "API: https://api.wcag.be"
        else
            log_warning "API may still be starting - check manually"
        fi
    fi
}

# Show summary
show_summary() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}${BOLD}  Deployment Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${BOLD}URLs:${NC}"
    echo -e "    Frontend:  ${CYAN}https://wcag.be${NC}"
    echo -e "    API:       ${CYAN}https://api.wcag.be${NC}"
    echo ""
    echo -e "  ${BOLD}Deployed:${NC}"
    $DEPLOY_FRONTEND && echo -e "    ${GREEN}✓${NC} Frontend"
    $DEPLOY_API && echo -e "    ${GREEN}✓${NC} API"
    $DEPLOY_DATABASE && echo -e "    ${GREEN}✓${NC} Database"
    echo ""
    echo -e "  ${BOLD}Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo -e "  ${YELLOW}Backups:${NC} $SERVER:$BACKUP_DIR/"
    echo ""
}

# Main execution
main() {
    parse_args "$@"

    # Show menu if no options provided
    if ! $DEPLOY_FRONTEND && ! $DEPLOY_API && ! $DEPLOY_DATABASE; then
        show_menu
    fi

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${BOLD}  WCAG Wayfinder - Deployment${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Show what will be deployed
    echo -e "  ${BOLD}Selected:${NC}"
    $DEPLOY_FRONTEND && echo -e "    ${GREEN}✓${NC} Frontend (web app)"
    $DEPLOY_API && echo -e "    ${GREEN}✓${NC} API (server + packages)"
    $DEPLOY_DATABASE && echo -e "    ${GREEN}✓${NC} Database (SQLite)"
    echo ""

    # Confirm
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    read -p "  Continue with deployment? [y/N] " -n 1 -r
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        log_warning "Deployment cancelled"
        exit 0
    fi

    # Run deployment
    preflight_checks

    if $DEPLOY_FRONTEND; then
        build_frontend
        deploy_frontend
    fi

    if $DEPLOY_API; then
        deploy_api
    fi

    if $DEPLOY_DATABASE; then
        deploy_database
    fi

    cleanup_backups
    verify_deployment
    show_summary
}

main "$@"
