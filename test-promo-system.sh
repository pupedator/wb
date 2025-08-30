#!/bin/bash

# Test script for promo code generation and usage
# This script tests the complete promo code flow

BASE_URL="http://localhost:3001"
ADMIN_EMAIL="admin@pixelcyberzone.com"
ADMIN_PASSWORD="admin123"

echo "🧪 Testing PixelCyberZone Promo Code System"
echo "============================================="

# Function to make API calls with better error handling
make_api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local headers="$4"
    
    echo "📡 Making $method request to $endpoint"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            curl -s -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data"
        else
            curl -s -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        fi
    else
        if [ -n "$headers" ]; then
            curl -s -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers"
        else
            curl -s -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json"
        fi
    fi
}

# Test 1: Check server health
echo -e "\n1️⃣  Testing server health..."
HEALTH_RESPONSE=$(make_api_call "GET" "/health")
echo "Health check response: $HEALTH_RESPONSE"

# Test 2: Admin login
echo -e "\n2️⃣  Testing admin login..."
LOGIN_DATA='{"email":"'$ADMIN_EMAIL'","password":"'$ADMIN_PASSWORD'"}'
LOGIN_RESPONSE=$(make_api_call "POST" "/api/auth/login" "$LOGIN_DATA")
echo "Login response: $LOGIN_RESPONSE"

# Extract token from login response
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token. Cannot continue tests."
    exit 1
fi
echo "✅ Admin token obtained: ${TOKEN:0:20}..."

# Test 3: Get available cases
echo -e "\n3️⃣  Testing get cases..."
CASES_RESPONSE=$(make_api_call "GET" "/api/cases")
echo "Cases response: $CASES_RESPONSE"

# Test 4: Generate promo code for Cyber Starter case
echo -e "\n4️⃣  Testing promo code generation..."
GENERATE_DATA='{"caseId":"cyber-starter"}'
GENERATE_RESPONSE=$(make_api_call "POST" "/api/promo-codes/generate" "$GENERATE_DATA" "Authorization: Bearer $TOKEN")
echo "Generate promo code response: $GENERATE_RESPONSE"

# Extract generated promo code
PROMO_CODE=$(echo "$GENERATE_RESPONSE" | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
if [ -z "$PROMO_CODE" ]; then
    echo "❌ Failed to generate promo code. Cannot continue tests."
    exit 1
fi
echo "✅ Generated promo code: $PROMO_CODE"

# Test 5: Validate promo code
echo -e "\n5️⃣  Testing promo code validation..."
VALIDATE_DATA='{"caseId":"cyber-starter","promoCode":"'$PROMO_CODE'"}'
VALIDATE_RESPONSE=$(make_api_call "POST" "/api/promo-codes/validate" "$VALIDATE_DATA")
echo "Validate promo code response: $VALIDATE_RESPONSE"

# Test 6: Try to validate promo code with wrong case (should fail)
echo -e "\n6️⃣  Testing promo code validation with wrong case..."
WRONG_VALIDATE_DATA='{"caseId":"pro-gamer","promoCode":"'$PROMO_CODE'"}'
WRONG_VALIDATE_RESPONSE=$(make_api_call "POST" "/api/promo-codes/validate" "$WRONG_VALIDATE_DATA")
echo "Wrong case validation response: $WRONG_VALIDATE_RESPONSE"

# Test 7: Get promo codes list
echo -e "\n7️⃣  Testing get promo codes list..."
LIST_RESPONSE=$(make_api_call "GET" "/api/promo-codes" "" "Authorization: Bearer $TOKEN")
echo "Promo codes list response: $LIST_RESPONSE"

# Test 8: Get promo code statistics
echo -e "\n8️⃣  Testing promo code statistics..."
STATS_RESPONSE=$(make_api_call "GET" "/api/promo-codes/stats" "" "Authorization: Bearer $TOKEN")
echo "Promo code stats response: $STATS_RESPONSE"

# Test 9: Test bulk generation
echo -e "\n9️⃣  Testing bulk promo code generation..."
BULK_DATA='{"caseId":"pro-gamer","count":3,"expirationHours":48}'
BULK_RESPONSE=$(make_api_call "POST" "/api/promo-codes/bulk" "$BULK_DATA" "Authorization: Bearer $TOKEN")
echo "Bulk generation response: $BULK_RESPONSE"

echo -e "\n✅ All tests completed!"
echo "============================================="
echo "🔍 Check the responses above for any errors."
echo "🚀 If all responses show 'success: true', the system is working!"
