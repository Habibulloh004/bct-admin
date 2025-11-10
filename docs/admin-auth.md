# Admin Authentication Guide

Use this document when you need to port the admin authentication flow from `bct-admin` into another project. It explains how the UI decides between the login screen and the dashboard, how tokens are stored, and what the backend endpoints must provide.

---

## 1. Runtime Overview

- The root page (`src/app/page.js`) checks authentication on mount. If a valid session exists, the dashboard renders; otherwise the login form appears.
- Authentication state lives inside the Zustand store (`src/lib/store.js`). The store provides helpers for logging in, restoring sessions from `localStorage`, refreshing tokens, and logging out.
- All API calls flow through `src/actions/api.js`, which automatically injects the bearer token stored in the Zustand state.

---

## 2. Client-Side Flow

### 2.1 Entry Point (`src/app/page.js`)

```js
const { isAuthenticated, authChecked, initAuth } = useStore();

useEffect(() => {
  initAuth();          // loads token/user from localStorage
  setIsLoading(false); // stop showing the spinner
}, [initAuth]);

return isAuthenticated ? <AdminDashboard /> : <LoginForm />;
```

- `initAuth` sets `authChecked` so the UI can remove the loading spinner once local storage is read.
- When `isAuthenticated` is false, the `LoginForm` component is rendered.

### 2.2 Login Form (`src/components/LoginForm.js`)

```js
const { login, loading, error, clearError } = useStore();

const handleSubmit = async (event) => {
  event.preventDefault();
  clearError();
  await login(name, password);
};
```

- Uses the store’s `login` action. Any error message from the store appears above the form.
- Honors the global language picker provided by `useLanguage`, so validation and button labels can be translated.

---

## 3. Zustand Store Responsibilities (`src/lib/store.js`)

### 3.1 Session Restore (`initAuth`)

```js
const savedToken = localStorage.getItem('admin_token');
const savedUser = localStorage.getItem('admin_user');

if (savedToken && savedUser) {
  set({ user, isAuthenticated: true, authToken: savedToken, authChecked: true });
} else {
  set({ authChecked: true, authToken: null });
}
```

- Called on every page load to recover the persisted session.
- Sets `authChecked` to `true` so the UI knows the initial check has finished.

### 3.2 Login (`login`)

```js
const { data: response } = await postApi('admin/login', { name, password }, { baseUrl });
const { token, admin } = response;

set({ user: admin, isAuthenticated: true, authToken: token, authChecked: true });
localStorage.setItem('admin_token', token);
localStorage.setItem('admin_user', JSON.stringify(admin));
```

- Calls the backend `POST admin/login` endpoint via `postApi`.
- Persists the returned `token` and `admin` payload to both state and `localStorage`.

### 3.3 Token Access (`getAuthToken`)

```js
const stateToken = get().authToken;
if (stateToken) return stateToken;
const storedToken = localStorage.getItem('admin_token');
```

- Ensures every action (`fetchData`, `createItem`, `uploadFile`, etc.) can obtain the latest bearer token, even after a refresh.

### 3.4 Update Admin Credentials (`updateAdmin`)

```js
const { token: newToken, admin } = await putApi('admin/update', {...}, { token: authToken });
const effectiveToken = newToken || authToken;
```

- Supports password/username changes. If the backend issues a new token, it replaces the stored one; otherwise it keeps the current token.

### 3.5 Logout (`logout`)

```js
set({ user: null, isAuthenticated: false, data: {}, authToken: null });
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
```

- Clears all admin-specific state and cached collections so the next login starts clean.

---

## 4. API Helper Layer (`src/actions/api.js`)

- `postApi`, `putApi`, etc. wrap `fetch` and accept a `token` argument.
- The helper adds an `Authorization: Bearer ${token}` header automatically.
- `baseUrl` falls back to `NEXT_PUBLIC_BASE_URL`, `API_BASE_URL`, or localhost. Adjust these env vars in the target project so all admin calls point to the correct backend.

---

## 5. Backend Requirements

To reuse this client flow, your backend must expose the following endpoints:

| Endpoint | Method | Expected Response |
| --- | --- | --- |
| `/admin/login` | POST | `{ token: string, admin: { ... } }` |
| `/admin/update` | PUT | `{ admin: { ... }, token?: string }` (token optional) |
| Any protected resource | GET/POST/PUT/DELETE | Requires `Authorization: Bearer <token>` header |
| `/files/upload` | POST | Accepts `multipart/form-data` + token, returns `{ url: string }` |

- Tokens should be valid for all subsequent CRUD requests performed by the dashboard (`/products`, `/categories`, etc.).
- Return HTTP errors (401/403) when the token is invalid; the store will bubble up the message to the UI.

---

## 6. Configuration & Migration Checklist

1. **Environment**  
   Set `NEXT_PUBLIC_BASE_URL` (and optionally `API_BASE_URL`) so the store targets the correct admin API host.  
   Example: `NEXT_PUBLIC_BASE_URL=https://api.example.com/admin`.

2. **Persisted Keys**  
   Ensure the new project has access to `localStorage` (i.e., runs in the browser). Tokens are stored under `admin_token`; user info under `admin_user`.

3. **Auth Context**  
   Import `useStore` in your root layout or page component and call `initAuth()` inside a `useEffect` before rendering protected content.

4. **API Layer**  
   Reuse the helpers from `src/actions/api.js` or adapt your existing client to accept a bearer token parameter.

5. **UI Components**  
   Port `LoginForm` and plug it into your routing so unauthenticated admins are redirected to the login screen.

6. **Testing**  
   - Attempt login with valid and invalid credentials.  
   - Refresh the page to verify session persistence.  
   - Trigger a password change and confirm the new token is stored.  
   - Call a protected endpoint after `logout()` to confirm it fails.

Following this guide will let you recreate the `bct-admin` authentication experience—session persistence, token management, and protected API access—in another React/Next.js project.

