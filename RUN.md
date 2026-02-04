# How to Run Soundage (API + Web)

You need **two terminals**: one for the API (backend) and one for the web app (frontend). Start the database and API first, then the web app.

---

## 1. Start the database (API needs PostgreSQL)

From the **project root**:

```bash
cd api
docker-compose up -d db adminer
```

Wait a few seconds for PostgreSQL to be ready. Optional: [Adminer](http://localhost:8081) to inspect the DB.

---

## 2. Run the API (Spring Boot)

In the **same** terminal (or a new one), from the **api** folder:

```bash
cd api
./mvnw spring-boot:run
```

Or on Windows:

```bash
cd api
mvnw.cmd spring-boot:run
```

- API base URL: **http://localhost:8080**
- Swagger: http://localhost:8080/swagger-ui.html

Leave this terminal running.

---

## 3. Run the web app (Angular)

Open a **second terminal**, from the **project root**:

```bash
cd web
pnpm install
pnpm dev
```

- Web app: **http://localhost:4200**

Leave this terminal running.

---

## Quick reference

| What     | Command (from project root)                 | URL                            |
| -------- | ------------------------------------------- | ------------------------------ |
| Database | `cd api && docker-compose up -d db adminer` | Adminer: http://localhost:8081 |
| API      | `cd api && ./mvnw spring-boot:run`          | http://localhost:8080          |
| Web app  | `cd web && pnpm dev`                        | http://localhost:4200          |

---

## First time use

1. Open **http://localhost:4200** → you are redirected to **Login**.
2. Click **Sign up** → create an account (e.g. email + password).
3. Sign in with the same credentials → you see the **Home** page.
4. If you create a user with role **ADMIN** (via API or seed), that user will see **Users** in the sidebar and can open the admin users list.

---

## Troubleshooting

- **API won’t start / “Connection refused” to DB**  
  Start the database first: `cd api && docker-compose up -d db adminer`, then run the API again.

- **Web can’t reach API**  
  Ensure the API is running on port 8080. The web app is configured to use `http://localhost:8080` (see `web/src/environments/environment.ts`).

- **Port 8080 or 4200 already in use**  
  Stop the other process using that port, or change the port in `api/src/main/resources/application.properties` (API) or `web/angular.json` (web).

- **CORS errors in the browser**  
  The API has CORS enabled for `http://localhost:4200`. If you use another origin, update `api/src/main/java/com/soundage/api/config/CorsConfig.java`.
