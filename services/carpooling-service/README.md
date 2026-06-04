# Carpooling Service

## Routes

- GET / - service status message.
- GET /carpooling/health - health check endpoint.
- GET /carpooling - list rides stub.
- POST /carpooling - create rides stub.

## Notes

- Protected routes require Authorization: Bearer <token>.
- Controllers include TODO markers for domain-specific business logic.
