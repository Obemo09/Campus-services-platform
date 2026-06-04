# Notification Service

## Routes

- `GET /` - service status message.
- `GET /notifications/health` - health check endpoint.
- `GET /notifications` - list notifications stub.
- `POST /notifications` - create notification stub.

## Events

The service connects to RabbitMQ and listens for these routing keys:

- `BookingConfirmed`
- `EventCreated`
- `ItemListed`

## Notes

- Event handling currently logs incoming payloads as a placeholder for email or push delivery.
- Protected routes require `Authorization: Bearer <token>`.
