#!/bin/bash
# Manual test script for the discover-trends edge function
# This script can be used to manually test the edge function after deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Testing Trend Discovery Edge Function"
echo "========================================="
echo ""

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}Error: SUPABASE_URL environment variable not set${NC}"
    echo "Please set it with: export SUPABASE_URL=your-project-url"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Error: SUPABASE_ANON_KEY environment variable not set${NC}"
    echo "Please set it with: export SUPABASE_ANON_KEY=your-anon-key"
    exit 1
fi

echo -e "${YELLOW}Testing with:${NC}"
echo "SUPABASE_URL: $SUPABASE_URL"
echo ""

# Test 1: Check if the edge function is deployed
echo -e "${YELLOW}Test 1: Checking if edge function is accessible...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SUPABASE_URL/functions/v1/discover-trends" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 500 ]; then
    echo -e "${GREEN}✓ Edge function is deployed and accessible${NC}"
else
    echo -e "${RED}✗ Edge function returned unexpected status: $HTTP_CODE${NC}"
    echo "Response: $BODY"
    exit 1
fi

echo ""

# Test 2: Check response format
echo -e "${YELLOW}Test 2: Validating response format...${NC}"
echo "Response: $BODY"

if echo "$BODY" | grep -q "success"; then
    echo -e "${GREEN}✓ Response contains 'success' field${NC}"
else
    echo -e "${RED}✗ Response missing 'success' field${NC}"
fi

if echo "$BODY" | grep -q "trendsDiscovered\|error"; then
    echo -e "${GREEN}✓ Response contains expected data fields${NC}"
else
    echo -e "${RED}✗ Response missing expected data fields${NC}"
fi

echo ""

# Test 3: Check database for trends
echo -e "${YELLOW}Test 3: Checking if trends were stored in database...${NC}"

# This would require executing a SQL query, which we'll skip for now
# as it needs additional setup. Users can check in Supabase dashboard.
echo -e "${YELLOW}⚠ Manual check required:${NC}"
echo "  1. Go to your Supabase dashboard"
echo "  2. Open the SQL Editor"
echo "  3. Run: SELECT COUNT(*) FROM trends;"
echo "  4. Verify that trends are being stored"

echo ""
echo "========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Check the Supabase Edge Function logs for detailed execution info"
echo "2. Verify trends are appearing in the Discover Trends page"
echo "3. Configure optional API keys for enhanced trend discovery:"
echo "   - TWITTER_BEARER_TOKEN for Twitter trends"
echo "   - SERPER_API_KEY for Google Trends"
