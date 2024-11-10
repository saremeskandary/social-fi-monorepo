#!/bin/bash

# Set strict error handling
set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="deployment.log"

# Function to log messages to both console and file
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$message" | tee -a "$LOG_FILE"
}

log_error() {
    log "${RED}ERROR: $1${NC}"
}

log_success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

log_warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 command not found. Please install it first."
        exit 1
    fi
}

# Function to cleanup existing processes
cleanup() {
    log "Starting cleanup process..."
    
    # Kill existing processes
    if pgrep dfx > /dev/null; then
        sudo killall dfx 2>/dev/null || true
        log "Stopped dfx process"
    fi
    
    if pgrep icx-proxy > /dev/null; then
        sudo killall icx-proxy 2>/dev/null || true
        log "Stopped icx-proxy process"
    fi
    
    if pgrep replica > /dev/null; then
        sudo killall replica 2>/dev/null || true
        log "Stopped replica process"
    fi

    # Remove .dfx directory
    if [ -d ".dfx" ]; then
        rm -rf .dfx
        log "Removed .dfx directory"
    fi

    log_success "Cleanup completed"
}

# Function to wait for dfx to be ready
wait_for_dfx() {
    local max_attempts=30
    local attempt=1
    
    log "Waiting for dfx to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://127.0.0.1:8000/ > /dev/null; then
            log_success "DFX is ready"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    log_error "DFX failed to start after $max_attempts seconds"
    exit 1
}

# Main deployment function
deploy() {
    # Create new log file
    : > "$LOG_FILE"
    log "Starting deployment process..."

    # Check required commands
    check_command dfx

    # Cleanup existing deployment
    cleanup

    # Start dfx
    log "Starting dfx..."
    dfx start --clean --background
    wait_for_dfx

    # Deploy user_manager
    log "Deploying user_manager canister..."
    dfx deploy user_manager
    
    # Get user_manager canister ID
    USER_MANAGER_ID=$(dfx canister id user_manager)
    if [ -z "$USER_MANAGER_ID" ]; then
        log_error "Failed to get user_manager canister ID"
        exit 1
    fi
    log_success "User manager deployed with ID: $USER_MANAGER_ID"

    # Deploy social_media_dapp with user_manager ID
    log "Deploying social_media_dapp canister..."
    dfx deploy social_media_dapp --argument "(\"$USER_MANAGER_ID\")"
    
    # Deploy test canister
    log "Deploying test canister..."
    dfx deploy social_media_dapp_test

    # Final success message
    log_success "Deployment completed successfully!"
    log "User Manager ID: $USER_MANAGER_ID"
    log "Social Media DApp ID: $(dfx canister id social_media_dapp)"
    log "Test Canister ID: $(dfx canister id social_media_dapp_test)"
}

# Trap errors
trap 'log_error "An error occurred during deployment. Check deployment.log for details."; exit 1' ERR

# Run deployment
deploy

exit 0