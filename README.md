# Fieldnotes frontend starter

A React 19 + strict TypeScript client for the companion Express + Mongoose API.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
npm install
cp .env.example .env
npm run dev
```

In Windows PowerShell, copy the environment template with `Copy-Item .env.example .env`.
Run the backend on port 3000 too. Vite proxies `/api` to `http://localhost:3000` so refresh cookies remain same-origin. `VITE_API_URL` defaults to `/api`; change it only when the API uses a different base path.

Useful checks:

```sh
npm run typecheck
npm run build
npm test
```

## Folder map

- `src/api/` — Axios client, memory-only access-token store, and backend response types.
- `src/auth/` — Auth provider and actions, refresh serialization, route guards, and auth error mapping.
- `src/features/items/` — Item and session query/mutation hooks plus the dashboard's item UI.
- `src/pages/` — Dashboard, login, registration, active sessions, and not-found pages.
- `src/components/` — Shared application layout and navigation.
- `src/lib/` — Shared TanStack Query client and centralized query-key factory.
- `src/test/` — Vitest setup for Testing Library matchers.

## Authentication flow

The backend sends a long-lived refresh token in an httpOnly cookie scoped to `/api/auth`; browser JavaScript cannot read it. The short-lived access token is stored in a module variable only, never localStorage or sessionStorage, and is sent in the `Authorization: Bearer` header.

On app startup, the auth provider calls `POST /auth/refresh` and then `GET /users/me` before protected routes decide whether to redirect. Refresh uses a bare Axios request to avoid interceptor loops. Calls in one tab share an in-flight promise; across tabs, the browser's `auth-refresh` Web Lock serializes cookie rotation because replaying a rotated token revokes that device's session.

For one 401 from a non-auth route, Axios refreshes and retries the original request exactly once. Login, registration, and refresh 401s pass straight through. If refresh fails, the client clears the token and auth state and navigates to login. Login and registration set the user/access token from their response while the server sets the refresh cookie. Logout always clears local auth, even if its network request fails; logout-all requires a valid access token. Changing the password revokes all backend sessions and clears local auth.

## API and data behavior

JSON success responses use `{ "success": true, "data": ... }`. JSON errors use `{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }`; 204 responses have no body. Item list parameters are `page`, `limit`, `status`, `rating`, `q`, and `sort`. Components use feature hooks for all API calls; mutations invalidate related cache keys, and item deletion uses a rollback-capable optimistic update.
