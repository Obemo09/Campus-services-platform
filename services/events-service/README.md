# Events Service

## Routes

- GET / - service status message.
- GET /events/health - health check endpoint.
- GET /events - list events stub.
- POST /events - create events stub.

## Notes

- Protected routes require Authorization: Bearer <token>.
- Controllers include TODO markers for domain-specific business logic.
