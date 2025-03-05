#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting database migration...${NC}"

# Function to check if Supabase is in PATH
check_supabase_path() {
    # Check common Windows installation paths
    if [ -f "$LOCALAPPDATA/supabase/bin/supabase.exe" ]; then
        export PATH="$LOCALAPPDATA/supabase/bin:$PATH"
        return 0
    elif [ -f "$USERPROFILE/scoop/shims/supabase.exe" ]; then
        export PATH="$USERPROFILE/scoop/shims:$PATH"
        return 0
    fi
    return 1
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found in PATH. Checking common installation locations...${NC}"
    if check_supabase_path; then
        echo -e "${GREEN}Found Supabase CLI and added to PATH${NC}"
    else
        echo -e "${RED}Supabase CLI is not installed or not found. Please install it first.${NC}"
        echo -e "${YELLOW}You can install it using:${NC}"
        echo -e "1. winget install Supabase.CLI"
        echo -e "2. Or using Scoop:"
        echo -e "   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
        echo -e "   scoop install supabase"
        exit 1
    fi
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}Not logged in to Supabase. Please run 'supabase login' first.${NC}"
    exit 1
fi

# Get project reference
echo -e "${GREEN}Enter your Supabase project reference:${NC}"
read PROJECT_REF

# Link project
echo -e "${GREEN}Linking project...${NC}"
supabase link --project-ref $PROJECT_REF

# Push migrations
echo -e "${GREEN}Pushing migrations...${NC}"
supabase db push

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Migration completed successfully!${NC}"
    
    # Show database status
    echo -e "${GREEN}Current database status:${NC}"
    supabase db status
else
    echo -e "${RED}Migration failed!${NC}"
    exit 1
fi 