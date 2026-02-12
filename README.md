# NerveLess — Smart Alumni-Student Connect

Local quickstart

1. Install dependencies (root):

```bash
npm install
```

2. Start the backend:

```bash
npm start
```

By default the server runs on `http://localhost:3000`.

3. Start the frontend (quick dev preview):

```bash
cd frontend
npm install
npm run dev -- --host
```

Open the frontend at `http://localhost:5173`.

Running tests:

```bash
npm test
```

Notes:

- Use `.env.example` as a starting point for environment variables.
- The backend will attempt to use Redis for the rate-limiter if `REDIS_URL` is set; otherwise it falls back to an in-memory limiter (safe for local development).

Docker (quick local stack)

1. Build and start the app with MongoDB and Redis:

```bash
docker-compose up --build
```

2. The backend will be available at `http://localhost:3000` and the compose stack will provide `mongo` and `redis` services. To stop and remove containers run:

```bash
docker-compose down
```

Tip: copy `.env.example` to `.env` and edit secrets before running in any shared environment.

Key generation (developer):

To generate an RSA keypair for RS256 JWT signing (development):

```bash
node scripts/generate_jwt_keys.js
```

This writes `secrets/jwt_private.pem` and `secrets/jwt_public.pem`. In development you can set `JWT_PRIVATE_KEY_PATH=secrets/jwt_private.pem` and `JWT_PUBLIC_KEY_PATH=secrets/jwt_public.pem` or copy the key contents into environment variables `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`.
