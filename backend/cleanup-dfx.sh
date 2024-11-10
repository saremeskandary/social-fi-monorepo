#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

# Configuration
DFX_PORT=8000
RETRY_COUNT=30
RETRY_DELAY=2
BASE_CYCLES=50000000000000  # 50T cycles

# Error exit function
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    cleanup_processes
    exit 1
}

# Success message function
success_message() {
    echo -e "${GREEN}$1${NC}"
}

# Info message function
info_message() {
    echo -e "${BLUE}$1${NC}"
}

# Warning message function
warning_message() {
    echo -e "${YELLOW}$1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dfx version
check_dfx_version() {
    if ! command_exists dfx; then
        error_exit "dfx is not installed. Please install dfx first."
    fi
    
    local dfx_version=$(dfx --version | cut -d' ' -f2)
    info_message "Using dfx version: $dfx_version"
}

# Function to kill DFX processes
kill_dfx_processes() {
    info_message "Stopping DFX processes..."
    
    # Try graceful stop first
    dfx stop 2>/dev/null || true
    
    sleep 2
    
    # Get the script's own PID to avoid killing itself
    SCRIPT_PID=$$
    
    # Kill processes by name
    for PROC in dfx replica icx-proxy; do
        if pgrep -f "$PROC" >/dev/null; then
            warning_message "Killing $PROC processes..."
            pkill -9 -f "$PROC" || true
        fi
    done
    
    # Kill any process using dfx ports
    for PORT in $DFX_PORT 8006; do
        if lsof -ti:$PORT >/dev/null 2>&1; then
            warning_message "Killing process using port $PORT..."
            lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 2
}

# Function to clean DFX state
clean_dfx_state() {
    info_message "Cleaning DFX state..."
    
    # Remove dfx directories and files
    local dirs_to_clean=(".dfx/local" ".dfx/network" "target" "node_modules" "dist")
    for dir in "${dirs_to_clean[@]}"; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
        fi
    done
    
    # Remove any pid files
    find . -name "*.pid" -type f -delete 2>/dev/null || true
    
    # Remove webpack cache if it exists
    if [ -d ".dfx/.webpack-cache" ]; then
        rm -rf .dfx/.webpack-cache
    fi
    
    success_message "DFX state cleaned"
}

# Function to wait for port to be available
wait_for_port() {
    local port=$1
    local retry_count=0
    
    while lsof -i:$port >/dev/null 2>&1; do
        if [ $retry_count -ge $RETRY_COUNT ]; then
            error_exit "Timeout waiting for port $port to be free"
        fi
        warning_message "Waiting for port $port to be free... (Attempt $((retry_count + 1))/$RETRY_COUNT)"
        sleep $RETRY_DELAY
        retry_count=$((retry_count + 1))
    done
    
    success_message "Port $port is free"
}

# Function to wait for dfx to be ready
wait_for_dfx() {
    local retry_count=0
    
    info_message "Waiting for DFX to be ready..."
    while ! dfx ping >/dev/null 2>&1; do
        if [ $retry_count -ge $RETRY_COUNT ]; then
            error_exit "DFX failed to start after $RETRY_COUNT attempts"
        fi
        sleep $RETRY_DELAY
        retry_count=$((retry_count + 1))
    done
    
    success_message "DFX is ready"
}

# Function to deploy canisters
deploy_canisters() {
    info_message "Deploying canisters..."
    
    # Deploy UserManager
    info_message "Deploying UserManager..."
    if ! dfx deploy user_manager --with-cycles $BASE_CYCLES; then
        error_exit "Failed to deploy UserManager"
    fi
    
    # Get UserManager canister ID
    local user_manager_id=$(dfx canister id user_manager)
    if [ -z "$user_manager_id" ]; then
        error_exit "Failed to get UserManager canister ID"
    fi
    
    # Deploy SocialMediaDapp
    info_message "Deploying SocialMediaDapp..."
    if ! dfx deploy social_media_dapp --with-cycles $BASE_CYCLES --argument "(\"$user_manager_id\")"; then
        error_exit "Failed to deploy SocialMediaDapp"
    fi
    
    # Deploy test canister
    info_message "Deploying test canister..."
    if ! dfx deploy social_media_dapp_test --with-cycles $((BASE_CYCLES * 2)); then
        error_exit "Failed to deploy test canister"
    fi
    
    success_message "All canisters deployed successfully"
}

# Function to run tests
run_tests() {
    info_message "Initializing test canister..."
    if ! dfx canister call social_media_dapp_test initialize; then
        error_exit "Failed to initialize test canister"
    fi
    
    info_message "Running tests..."
    if ! dfx canister call social_media_dapp_test runAllTests; then
        error_exit "Tests failed"
    fi
    
    success_message "Tests completed successfully"
}

# Cleanup function for exit
cleanup_processes() {
    if [ "$?" -ne 0 ]; then
        warning_message "Script failed, cleaning up..."
    fi
    
    info_message "Cleaning up processes..."
    kill_dfx_processes
    clean_dfx_state
    success_message "Cleanup completed"
}

# Main execution
main() {
    # Set up error handling
    set -e
    trap cleanup_processes EXIT
    
    info_message "Starting cleanup and test process..."
    
    # Check dfx installation and version
    check_dfx_version
    
    # Kill existing processes and clean state
    kill_dfx_processes
    clean_dfx_state
    
    # Wait for port to be available
    wait_for_port $DFX_PORT
    
    # Start DFX
    info_message "Starting fresh DFX instance..."
    if ! dfx start --clean --background; then
        error_exit "Failed to start DFX"
    fi
    
    # Wait for DFX to be ready
    wait_for_dfx
    
    # Deploy canisters
    deploy_canisters
    
    # Run tests
    run_tests
    
    # Final cleanup
    info_message "Stopping DFX..."
    dfx stop
    
    success_message "Process completed successfully"
}

# Execute main function
main "$@"