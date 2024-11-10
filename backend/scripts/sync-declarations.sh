#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Get the parent directory (project root)
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# Frontend directory path
FRONTEND_DIR="$PROJECT_ROOT/../frontend"

# Source declarations directory
SOURCE_DECLARATIONS="$PROJECT_ROOT/src/declarations"

# Destination declarations directory
DEST_DECLARATIONS="$FRONTEND_DIR/declarations"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${YELLOW}Frontend directory not found at: $FRONTEND_DIR${NC}"
    exit 1
fi

# Create declarations directory in frontend if it doesn't exist
mkdir -p "$DEST_DECLARATIONS"

# Function to copy declaration files
copy_declarations() {
    local CANISTER_NAME=$1
    local SOURCE_DIR="$SOURCE_DECLARATIONS/$CANISTER_NAME"
    local DEST_DIR="$DEST_DECLARATIONS/$CANISTER_NAME"

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo -e "${YELLOW}Source directory not found for $CANISTER_NAME${NC}"
        return
    fi

    # Create destination directory
    mkdir -p "$DEST_DIR"

    # Copy declaration files
    cp -r "$SOURCE_DIR"/* "$DEST_DIR"/

    echo -e "${GREEN}✓ Copied declarations for $CANISTER_NAME${NC}"
}

# Copy declarations for each canister
copy_declarations "social_media_dapp"
copy_declarations "user_manager"

# Create index.ts
cat > "$DEST_DECLARATIONS/index.ts" << 'EOL'
export type { _SERVICE as UserManagerService } from './user_manager/user_manager.did';
export type { _SERVICE as SocialMediaService } from './social_media_dapp/social_media_dapp.did';
export { idlFactory as userManagerFactory } from './user_manager/user_manager.did.js';
export { idlFactory as socialMediaFactory } from './social_media_dapp/social_media_dapp.did.js';
EOL

echo -e "${GREEN}✓ Created declarations/index.ts${NC}"
echo -e "${GREEN}✓ Declarations sync complete!${NC}"