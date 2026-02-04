# How to Run the Application

## Option 1: Run with Docker Compose (Recommended)

This runs the database, Adminer, and API together.

### Step 1: Start Database and Adminer
```bash
docker-compose up -d db adminer
```

### Step 2: Run the Application Locally
```bash
# Set environment variables for local connection
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/soundage
export SPRING_DATASOURCE_USERNAME=soundage
export SPRING_DATASOURCE_PASSWORD=soundage
export JWT_SECRET=Zkes5eJpfOFLT+982JhcAnDetKNrgROUhIHmjuRcvzotXgmD5UTbUUl3uP7Nfq9h5XI/JRG7hOjw5Pd2J0bh9w==

# Run the application
./mvnw spring-boot:run
```

Or using Maven directly:
```bash
mvn spring-boot:run
```

## Option 2: Run Everything with Docker Compose

### Start all services (database, Adminer, and API)
```bash
docker-compose up
```

**Note:** This requires a Dockerfile in the `./api` directory. If you don't have one, use Option 1.

## Option 3: Run Locally with Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create the database:
```sql
CREATE DATABASE soundage;
CREATE USER soundage WITH PASSWORD 'soundage';
GRANT ALL PRIVILEGES ON DATABASE soundage TO soundage;
```

2. Set environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/soundage
export SPRING_DATASOURCE_USERNAME=soundage
export SPRING_DATASOURCE_PASSWORD=soundage
export JWT_SECRET=Zkes5eJpfOFLT+982JhcAnDetKNrgROUhIHmjuRcvzotXgmD5UTbUUl3uP7Nfq9h5XI/JRG7hOjw5Pd2J0bh9w==
```

3. Run the application:
```bash
./mvnw spring-boot:run
```

## Access Points

Once running, you can access:

- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Adminer**: http://localhost:8081 (if using Docker)

## API Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/users/me` - Get current user (requires authentication)
- `GET /api/users/{id}` - Get user by ID (requires ADMIN role)

## Troubleshooting

- **Database connection error**: Make sure the database is running and accessible
- **Port already in use**: Change the port in `application.properties` or stop the conflicting service
- **Migration errors**: Check that the database is empty or compatible with the migrations
