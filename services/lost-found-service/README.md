# Lost & Found Service

## Routes

- GET / - service status message.
- GET /lost-found/health - health check endpoint.
- GET /lost-found - list items stub.
- POST /lost-found - create items stub.

## Notes

- Protected routes require Authorization: Bearer <token>.
- Controllers include TODO markers for domain-specific business logic.
