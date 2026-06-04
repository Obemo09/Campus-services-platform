# Auth Service

## Routes

- `GET /` - service status message.
- `GET /auth/health` - health check endpoint.
- `POST /auth/register` - create a new user with `name`, `email`, and `password`.
- `POST /auth/login` - authenticate a user and return a JWT.
- `GET /auth/me` - return the currently authenticated user.

## Notes

- Uses MongoDB with Mongoose for user persistence.
- Passwords are hashed with bcrypt.
- `Authorization: Bearer <token>` is required for `/auth/me`.
