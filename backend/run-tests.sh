#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

echo -e "${YELLOW}Starting test environment...${NC}"

# Check and sync time if needed
if command -v ntpdate &> /dev/null; then
    echo -e "${YELLOW}Synchronizing system clock...${NC}"
    sudo ntpdate -u time.apple.com || {
        echo -e "${RED}Failed to sync clock. Please sync manually or run:${NC}"
        echo "sudo ntpdate -u time.apple.com"
        exit 1
    }
else
    echo -e "${YELLOW}Warning: ntpdate not found. Please ensure your system clock is synchronized${NC}"
fi

# Stop any running dfx instance
echo -e "${YELLOW}Stopping any running dfx instances...${NC}"
dfx stop

# Start dfx fresh
echo -e "${YELLOW}Starting local Internet Computer...${NC}"
dfx start --clean --background
sleep 5

# Clean and rebuild
echo -e "${YELLOW}Cleaning build artifacts...${NC}"
dfx cache delete
dfx cache create

# Deploy canisters
echo -e "${YELLOW}Deploying canisters...${NC}"
if dfx deploy; then
    echo -e "${GREEN}Deployment successful${NC}"
else
    echo -e "${RED}Deployment failed${NC}"
    exit 1
fi

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
if dfx canister call social_media_dapp_test runAllTests; then
    echo -e "${GREEN}All tests completed successfully${NC}"
else
    echo -e "${RED}Tests failed${NC}"
    exit 1
fi