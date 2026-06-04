# Campus Services Platform

Campus Services Platform is a Node.js microservices monorepo for common campus workflows such as authentication, bookings, events, marketplace listings, lost-and-found items, carpooling, and notifications.

## Services

- `api-gateway` - entrypoint and reverse proxy for all backend services.
- `auth-service` - registration, login, and current-user lookup.
- `booking-service` - booking workflow stubs.
- `events-service` - event management stubs.
- `marketplace-service` - marketplace listing stubs.
- `lost-found-service` - lost-and-found item stubs.
- `carpooling-service` - ride-sharing stubs.
- `notification-service` - RabbitMQ event listener for outbound notifications.

## Prerequisites

- Docker
- Docker Compose

## Run With Docker Compose

1. Copy each service `.env.example` to `.env` if you want to override defaults.
2. From the `campus-platform` directory run:

```bash
docker-compose up --build
```

3. Access the services:

- API Gateway: `http://localhost:3000`
- Auth Service: `http://localhost:3001`
- Booking Service: `http://localhost:3002`
- Events Service: `http://localhost:3003`
- Marketplace Service: `http://localhost:3004`
- Lost & Found Service: `http://localhost:3005`
- Carpooling Service: `http://localhost:3006`
- Notification Service: `http://localhost:3007`

## Notes

- MongoDB is shared across services.
- RabbitMQ is used for event-driven messaging.
- The API Gateway validates JWTs on every route except `/auth/*`.
- Boilerplate controllers include TODO markers so each domain can be expanded safely.
