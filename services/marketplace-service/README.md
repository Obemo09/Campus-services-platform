# Marketplace Service

## Routes

- GET / - service status message.
- GET /marketplace/health - health check endpoint.
- GET /marketplace - list listings stub.
- POST /marketplace - create listings stub.

## Notes

- Protected routes require Authorization: Bearer <token>.
- Controllers include TODO markers for domain-specific business logic.
