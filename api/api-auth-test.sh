#!/usr/bin/env bash
# Soundage API – Auth tests (signup, login, refresh)
# Usage: ./api-auth-test.sh   or   bash api-auth-test.sh
# Ensure the app is running: ./mvnw spring-boot:run

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "=== 1. SIGNUP ==="
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER"
  }')
echo "$SIGNUP_RESPONSE" | jq . 2>/dev/null || echo "$SIGNUP_RESPONSE"

echo ""
echo "=== 2. LOGIN ==="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract tokens for refresh (requires jq)
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.refreshToken // empty')

echo ""
echo "=== 3. REFRESH TOKEN ==="
if [ -n "$REFRESH_TOKEN" ]; then
  curl -s -X POST "$BASE_URL/api/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq . 2>/dev/null || cat
else
  echo "No refresh token from login; skipping refresh. Run login first."
fi

echo ""
echo "=== 4. ME (authenticated) ==="
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X GET "$BASE_URL/api/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || cat
else
  echo "No access token; skipping /api/users/me"
fi
