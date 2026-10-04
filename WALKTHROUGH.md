# Code walkthrough

## Source files (two lines per file)

Each entry has exactly two lines: the file path, followed by what it does.

`src/App.tsx`
Declares application routes and nests private/public-only pages beneath their guards.

`src/main.tsx`
Bootstraps React StrictMode, BrowserRouter, AuthProvider, and the shared QueryClient.

`src/api/client.ts`
Creates the cookie-enabled Axios client, attaches the access credential, and manages one refresh/retry.

`src/api/client.test.ts`
Checks that a protected request receiving 401 has exactly one refresh and one retry.

`src/api/contract.ts`
Defines backend envelope, error, user, session, item, and request payload types.

`src/api/tokenStore.ts`
Keeps the access token in a module variable with explicit getter and setter functions.

`src/auth/AuthContext.tsx`
Restores the session, clears query cache on logout/expiry, and exposes auth state and actions.

`src/auth/AuthContext.test.tsx`
Checks that logging out clears item data from the shared query cache.

`src/auth/formErrors.ts`
Maps backend auth validation detail paths and credential errors to form feedback.

`src/auth/ProtectedRoute.tsx`
Waits for auth restoration, then protects child routes and remembers the requested location.

`src/auth/ProtectedRoute.test.tsx`
Checks the signed-out redirect and preservation of the pathname and query string.

`src/auth/PublicOnlyRoute.tsx`
Shows the bootstrap spinner and redirects signed-in users to the dashboard.

`src/auth/refresh.ts`
Shares a refresh promise per tab and serializes cookie rotation across tabs with Web Locks.

`src/auth/refresh.test.ts`
Checks concurrent refresh calls share one request and use the named browser lock.

`src/auth/useAuth.ts`
Exposes the auth context and reports misuse outside an AuthProvider.

`src/components/AppLayout.tsx`
Renders responsive navigation, current account information, and sign out around each page.

`src/features/items/formErrors.ts`
Maps backend item validation details onto item editor fields.

`src/features/items/hooks.ts`
Owns item network requests, cache updates, invalidation, and optimistic rollback.

`src/features/items/hooks.test.tsx`
Checks a failed optimistic item deletion restores the previous cached list.

`src/features/items/ItemForm.tsx`
Validates item create/edit fields and presents field errors and pending submit states.

`src/features/items/ItemList.tsx`
Displays item search, status/rating filters, sorting, pagination, and create/edit/delete actions.

`src/features/items/ItemStats.tsx`
Displays backend totals and ratings with dedicated loading and error states.

`src/features/sessions/hooks.ts`
Owns active-session fetching and revoke mutations, updating the session cache after revocation.

`src/features/sessions/queryKeys.ts`
Defines the sessions cache key beside the session hooks that use it.

`src/index.css`
Imports Tailwind v4 and applies the small set of global document defaults.

`src/App.css`
Unused stylesheet retained from the Vite template; the application styling is in Tailwind utilities.

`src/assets/hero.png`
Unused decorative image left by the Vite template and not imported by the application.

`src/assets/react.svg`
Unused React logo asset left by the Vite template.

`src/assets/vite.svg`
Unused Vite logo asset left by the Vite template.

`src/lib/queryClient.ts`
Creates the shared QueryClient with a stale time and retry policy that avoids retrying 4xx errors.

`src/lib/queryKeys.ts`
Centralizes hierarchical cache keys for item lists, details, and stats.

`src/pages/DashboardPage.tsx`
Composes the statistics cards and item list for the main workspace.

`src/pages/LoginPage.tsx`
Validates login, maps server failures, and navigates back to the originally requested location.

`src/pages/LoginPage.test.tsx`
Checks email and password validation and confirms invalid credentials are not submitted.

`src/pages/NotFoundPage.tsx`
Shows a not-found page with a link back to the dashboard.

`src/pages/RegisterPage.tsx`
Validates account creation and shows field and form-level server feedback.

`src/pages/SessionsPage.tsx`
Lists active sessions, highlights this device, and revokes selected sessions.

`public/favicon.svg`
Provides the starter site's browser-tab icon.

`public/icons.svg`
Contains the Vite template's unused icon sprite.

`src/test/setup.ts`
Registers Testing Library DOM assertions for Vitest.

`.env.example`
Documents the default API base URL that Vite proxies to the backend.

`vite.config.ts`
Enables React, Tailwind v4, the backend development proxy, and Vitest's DOM environment.

`tsconfig.app.json`
Enables strict TypeScript checks for the browser application source.

`package.json`
Lists runtime/development dependencies and the typecheck, build, test, lint, and preview scripts.

`index.html`
Provides the root HTML element and Vite's application entry module.

`tsconfig.json`
Coordinates the referenced application and build-tool TypeScript configurations.

`tsconfig.node.json`
Enables strict TypeScript checks for the Vite configuration module.

`.gitignore`
Excludes generated build output, dependencies, local environment files, and editor artifacts.

## Hooks in plain English

- `useState` stores UI or provider state that should cause a render when changed, such as auth status, filters, form visibility, and errors.
- `useEffect` restores a cookie-backed session after mount and registers/cleans up the auth-expired event listener.
- `useMemo` keeps the auth context value stable unless its user or booting state changes.
- `useContext` reads the nearest AuthProvider value from the `useAuth` helper.
- `useLocation` reads the current route so login can return to the route a user first requested.
- `useNavigate` changes routes after login, logout/session expiry, or revoking the current session.
- `useForm` controls form values, pending submission, and client/server field errors; the Zod resolver applies schema validation.
- `useQuery` fetches and caches item lists, item detail, aggregate stats, and sessions.
- `useMutation` handles item writes and session revocation with lifecycle callbacks for cache coordination.
- `useQueryClient` accesses the shared cache to cancel, optimistically update, roll back, invalidate, and remove cached data.
- `useItems`, `useItem`, `useItemStats`, `useCreateItem`, `useUpdateItem`, and `useDeleteItem` are item feature hooks that wrap TanStack Query and keep Axios out of components.
- `useSessions` and `useRevokeSession` are session feature hooks in `src/features/sessions/hooks.ts`.
- `keepPreviousData` is TanStack Query's placeholder helper, not a React hook; it retains the prior page while the next page loads.

The app does not use `useCallback` or `useRef`: callbacks are not passed into memoized child trees and no mutable DOM/timer value needs to persist outside React state.

## How React renders

React represents component work in a Fiber tree. Fibers track component identity, props, state, and pending work so React can schedule and prioritize updates.

During render, React calls components and reconciles their returned element descriptions with the prior tree to calculate what needs to change. Render should remain pure because React can repeat or abandon this work.

During commit, React applies the calculated updates to the DOM and runs relevant layout/effect work. Keeping render separate from commit allows React to prepare changes before updating the visible interface.

Keys help reconciliation match each list element to the same record across insertion, deletion, and reordering. Stable backend IDs preserve the correct DOM and component state; array positions may refer to a different record after a change.

## Interview questions

1. Why does this frontend keep its access token in memory instead of persistent browser storage?
2. Why does refresh-token rotation use both an in-tab shared promise and a cross-tab Web Lock?
3. How does the request interceptor attach the access token to API requests?
4. How does the response interceptor ensure a request is not retried more than once?
5. Why does the auth provider delay protected routes until session restoration completes?
6. How does the application return a user to the route they originally requested after login?
7. Why are API operations placed in TanStack Query hooks instead of UI components?
8. How does the optimistic item deletion recover when its API request fails?
9. How does keeping previous data improve the paginated item list?
10. What issues can occur if an array index is used as a React list key?
