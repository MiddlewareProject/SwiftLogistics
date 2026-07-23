# SwiftLogistics

SwiftLogistics is a full-stack logistics platform with a React frontend, Spring Boot microservices, and Docker-based infrastructure for PostgreSQL and RabbitMQ.

## Project structure

- frontend: React + Vite client
- gateway: Spring Cloud Gateway entry point
- order-service: order management service
- tracking-service: shipment tracking service
- notification-service: notification processing service
- CMS_Adapter: CMS integration adapter
- ROS_Adapter: ROS integration adapter
- WMS_Adapter: WMS integration adapter
- docker-compose.yml: orchestrates all services and infrastructure dependencies

## Prerequisites

Make sure the following tools are installed before you start:

- Docker Desktop with Docker Compose v2
- Java 21
- Maven (optional, the repo includes Maven wrappers)
- Node.js 20+ and npm
- Git

For Windows PowerShell, use the Maven wrapper script with .cmd:

- .\mvnw.cmd

For Linux/macOS or WSL, use:

- ./mvnw

## 1. Clone and enter the project

```bash
git clone <repository-url>
cd SwiftLogistics_Project
```

## 2. Environment configuration

The repository already contains a root .env file with base database settings. Review it and adjust if needed:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/swiftlogistics
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

If you want to change credentials, update the values in the root .env file and keep them consistent with the PostgreSQL service configuration in docker-compose.yml.

## 3. Run the full stack with Docker Compose

From the project root, build and start all services:

```bash
docker compose up --build -d
```

### Access points

- Frontend: http://localhost:3000
- Gateway API: http://localhost:8080
- RabbitMQ UI: http://localhost:15672
  - Username: guest
  - Password: guest
- PostgreSQL: localhost:5432

### Stop the stack

```bash
docker compose down
```

