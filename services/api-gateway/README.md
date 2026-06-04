# API Gateway

## Routes

- `GET /` - gateway status message.
- `GET /health` - health check endpoint.
- `/*` - proxies requests to downstream services.

## Proxy Targets

- `/auth/*` -> auth-service
- `/bookings/*` -> booking-service
- `/events/*` -> events-service
- `/marketplace/*` -> marketplace-service
- `/lost-found/*` -> lost-found-service
- `/carpooling/*` -> carpooling-service
- `/notifications/*` -> notification-service

## Notes

- Applies JWT validation to every route except `/auth/*`.
- Uses `express-rate-limit` for basic request throttling.
