# Soundage API – Auth curl commands

Base URL: `http://localhost:8080` (override with `BASE=http://localhost:8080` if needed)

---

## 1. Signup

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

**Optional:** Signup as admin (if your app allows it via role):

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

---

## 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Seed admin user** (from V5 migration):

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin"
  }'
```

*(Check your seed data for the real admin password; the bcrypt in V5 may differ.)*

---

## 3. Refresh token

Replace `YOUR_REFRESH_TOKEN` with the `data.refreshToken` from the login response.

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## 4. Get current user (requires access token)

Replace `YOUR_ACCESS_TOKEN` with the `data.accessToken` from login (or signup).

```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Response shape

- **Success:** `{ "success": true, "message": "...", "data": { "accessToken": "...", "refreshToken": "...", "tokenType": "Bearer" }, "timestamp": "..." }`
- **Error:** `{ "success": false, "message": "...", "timestamp": "..." }`
