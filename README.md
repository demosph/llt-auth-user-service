# LLT Auth & User Service (API)

Express-based authentication & user profile service for LittleLifeTrip application.
Implements **JWT (access/refresh), session rotation, Google Identity Services (GIS) One-Tap / Button** via **ID Token**, user preferences CRUD, Swagger docs, and Sequelize/PostgreSQL.

## Stack

- **Runtime:** Node.js (Express 5)
- **DB:** PostgreSQL (separate DB per microservice)
- **ORM:** Sequelize
- **Validation:** Joi (+ joi-to-swagger)
- **Auth:** JSON Web Tokens (access & refresh), rotating refresh sessions
- **Docs:** Swagger UI (OpenAPI 3)
- **Logging/Misc:** morgan, cors
- **Container:** Dockerfile + docker-compose

## Features

- Local register/login with hashed passwords (bcrypt)
- Google Sign-in (GIS) **ID Token → backend verify (jose/JWKS)**
  (no OAuth code exchange, no Google refresh tokens here)
- Access/Refresh token pair with server-side **session store** and rotation
- `/users/me` profile & `/users/me/preferences` (home location, interests, transport, budget)
- Swagger UI under `/api/docs`
- Dev JSON error handler (parse/500)

## API Base URL

`http://localhost:3000/api/v1`

Swagger UI: `http://localhost:3000/auth/docs`

Note: Server is mounted at `/api/v1`

## Quick start (Docker)

`docker compose up --build`

- Service: http://localhost:3000
- Swagger: http://localhost:3000/auth/docs
- Postgres container for this service is included in `docker-compose.yml`.

## Local dev (without Docker)

```
npm i
npm run dev # nodemon
```

Make sure your Postgres is reachable using `.env` settings.

## Database & Migrations

For development you can enable:

```
// server.js (dev only)
await sequelize.sync({ alter: true });
```

- sync() **does not drop** data unless `force: true`.
- In **production** use migrations (Sequelize CLI/Umzug). Do **not** run `sync()` on start there.

## Endpoints (summary)

**Auth**

- `POST /auth/register` - create local user (`email`, `password`, `name`)
- `POST /auth/login` - login with email/password
- `POST /auth/refresh` - rotate refresh token, returns new pair
- `POST /auth/logout` - revoke current refresh token (if implemented)
- `POST /auth/oauth/google/idtoken` - **GIS ID Token** → verify & issue own tokens

**User**

- `GET /users/me` - current user profile
- `PATCH /users/me` - update name/avatar
- `GET /users/me/preferences` - get preferences
- `PATCH /users/me/preferences` - upsert preferences

## GIS (Google Identity Services) - testing without a frontend

**Static page with fetch to public config**
Expose `GET /public-config.json` returning `{ GOOGLE_CLIENT_ID }` and load it in the HTML before calling `google.accounts.id.initialize(...)`.

**Important GIS notes**

- Use a **Web application** OAuth Client in Google Cloud Console.
- Add your exact **origins** (scheme+host+port) to **Authorized JavaScript origins** (e.g. `http://localhost:8080`, `http://127.0.0.1:8080`, `http://localhost:3000`).
- The Client ID used in HTML (**data-client_id**) must equal `GOOGLE_CLIENT_ID` used by backend for `aud` verification.
- Don't open the page via `file://` - serve it over HTTP.

## Validation & Middleware

- Joi schemas validate `body`, `query`, `params`.
- Express 5 makes `req.query` a getter; the validation middleware does not overwrite it.
  Normalized values are available as `req.validated = { body, query, params }`.

## Security notes

- Short-lived **access token** (`JWT_ACCESS_TTL`, e.g. 15m)
- Long-lived **refresh token** with **rotation** (invalidate old, store hash in DB with expiry)
- Consider HttpOnly cookies for web clients (optional)
- Rate-limit auth endpoints (via API Gateway or an Express middleware)
